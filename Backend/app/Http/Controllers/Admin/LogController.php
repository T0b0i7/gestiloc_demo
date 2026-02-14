<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LogController extends Controller
{
    /**
     * Afficher la page des logs
     */
    public function index(Request $request)
    {
        // Récupérer tous les fichiers de logs
        $logFiles = $this->getLogFiles();
        $selectedLog = $request->get('log', 'laravel.log');
        $levelFilter = $request->get('level', 'all');
        $searchQuery = $request->get('search', '');

        // Lire le contenu du log
        $logContent = $this->getLogContent($selectedLog);

        // Niveaux de log disponibles
        $logLevels = [
            'all' => 'Tous les niveaux',
            'emergency' => 'Emergency',
            'alert' => 'Alert',
            'critical' => 'Critical',
            'error' => 'Error',
            'warning' => 'Warning',
            'notice' => 'Notice',
            'info' => 'Info',
            'debug' => 'Debug'
        ];

        // Filtrer les logs
        $filteredLogs = $this->filterLogs($logContent, $levelFilter, $searchQuery);

        // Statistiques
        $logStats = $this->getLogStatistics($filteredLogs);

        // Trier les logs par date (plus récent en premier)
        $filteredLogs = array_reverse($filteredLogs);

        // Pagination
        $perPage = 50;
        $currentPage = $request->get('page', 1);
        $totalLogs = count($filteredLogs);
        $offset = ($currentPage - 1) * $perPage;
        $paginatedLogs = array_slice($filteredLogs, $offset, $perPage);

        return view('admin.logs.index', [
            'logFiles' => $logFiles,
            'selectedLog' => $selectedLog,
            'logLevels' => $logLevels,
            'levelFilter' => $levelFilter,
            'searchQuery' => $searchQuery,
            'logs' => $paginatedLogs,
            'logStats' => $logStats,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
            'totalLogs' => $totalLogs,
            'totalPages' => ceil($totalLogs / $perPage)
        ]);
    }

    /**
     * Télécharger un fichier de log
     */
    public function download($filename)
    {
        $logPath = storage_path('logs/' . $filename);

        if (!File::exists($logPath)) {
            return redirect()->back()->with('error', 'Le fichier de log n\'existe pas.');
        }

        return response()->download($logPath, $filename);
    }

    /**
     * Effacer un fichier de log
     */
    public function clear($filename)
    {
        $logPath = storage_path('logs/' . $filename);

        if (!File::exists($logPath)) {
            return redirect()->back()->with('error', 'Le fichier de log n\'existe pas.');
        }

        // Sauvegarder l'ancien log
        if (File::exists($logPath)) {
            $backupName = $filename . '.' . date('Y-m-d_His') . '.backup';
            File::copy($logPath, storage_path('logs/' . $backupName));

            // Effacer le fichier
            File::put($logPath, '');
        }

        return redirect()->back()->with('success', 'Le fichier de log a été effacé avec succès. Une sauvegarde a été créée.');
    }

    /**
     * Effacer tous les logs
     */
    public function clearAll()
    {
        $logPath = storage_path('logs/');

        // Créer un dossier de sauvegarde
        $backupDir = storage_path('logs/backup-' . date('Y-m-d_His'));
        File::makeDirectory($backupDir);

        // Sauvegarder tous les fichiers de log
        $logFiles = File::files($logPath);
        foreach ($logFiles as $file) {
            if ($file->getExtension() === 'log') {
                $backupPath = $backupDir . '/' . $file->getFilename();
                File::copy($file->getPathname(), $backupPath);
                File::put($file->getPathname(), '');
            }
        }

        return redirect()->back()->with('success', 'Tous les logs ont été effacés. Les sauvegardes sont dans ' . $backupDir);
    }

    /**
     * Vue détaillée d'un log spécifique
     */
    public function show($filename, $logId)
    {
        $logPath = storage_path('logs/' . $filename);

        if (!File::exists($logPath)) {
            return redirect()->route('admin.logs.index')->with('error', 'Le fichier de log n\'existe pas.');
        }

        $logContent = File::get($logPath);
        $logLines = explode("\n", $logContent);

        // Trouver le log spécifique par son ID (ligne)
        $selectedLog = null;
        if (isset($logLines[$logId])) {
            $selectedLog = [
                'id' => $logId,
                'content' => $logLines[$logId],
                'details' => $this->parseLogLine($logLines[$logId])
            ];
        }

        return view('admin.logs.show', [
            'filename' => $filename,
            'log' => $selectedLog,
            'logId' => $logId
        ]);
    }

    /**
     * API pour récupérer les logs en temps réel (AJAX)
     */
    public function getLogsAjax(Request $request)
    {
        $filename = $request->get('file', 'laravel.log');
        $since = $request->get('since', 0);

        $logPath = storage_path('logs/' . $filename);

        if (!File::exists($logPath)) {
            return response()->json(['logs' => [], 'count' => 0]);
        }

        $logContent = File::get($logPath);
        $logLines = explode("\n", $logContent);

        // Récupérer uniquement les nouvelles lignes
        $newLines = array_slice($logLines, $since);
        $parsedLogs = [];

        foreach ($newLines as $index => $line) {
            if (!empty(trim($line))) {
                $parsedLogs[] = $this->parseLogLine($line);
            }
        }

        return response()->json([
            'logs' => $parsedLogs,
            'count' => count($parsedLogs),
            'totalLines' => count($logLines)
        ]);
    }

    /**
     * Récupérer tous les fichiers de logs
     */
    private function getLogFiles()
    {
        $logPath = storage_path('logs/');

        if (!File::exists($logPath)) {
            return [];
        }

        $files = File::files($logPath);
        $logFiles = [];

        foreach ($files as $file) {
            if ($file->getExtension() === 'log' || strpos($file->getFilename(), '.log.') !== false) {
                $logFiles[] = [
                    'name' => $file->getFilename(),
                    'size' => $this->formatBytes($file->getSize()),
                    'modified' => date('Y-m-d H:i:s', $file->getMTime()),
                    'path' => $file->getPathname()
                ];
            }
        }

        // Trier par date de modification (plus récent en premier)
        usort($logFiles, function($a, $b) {
            return strtotime($b['modified']) - strtotime($a['modified']);
        });

        return $logFiles;
    }

    /**
     * Lire le contenu d'un fichier de log
     */
    private function getLogContent($filename)
    {
        $logPath = storage_path('logs/' . $filename);

        if (!File::exists($logPath)) {
            return '';
        }

        return File::get($logPath);
    }

    /**
     * Parser une ligne de log
     */
    private function parseLogLine($line)
    {
        if (empty(trim($line))) {
            return null;
        }

        // Pattern pour les logs Laravel
        $pattern = '/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.*)$/';

        if (preg_match($pattern, $line, $matches)) {
            return [
                'timestamp' => $matches[1],
                'environment' => $matches[2],
                'level' => strtolower($matches[3]),
                'message' => $matches[4],
                'raw' => $line,
                'level_color' => $this->getLevelColor(strtolower($matches[3]))
            ];
        }

        // Pattern alternatif
        $pattern2 = '/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\S+): (.*)$/';
        if (preg_match($pattern2, $line, $matches)) {
            return [
                'timestamp' => $matches[1],
                'level' => strtolower($matches[2]),
                'message' => $matches[3],
                'raw' => $line,
                'level_color' => $this->getLevelColor(strtolower($matches[2]))
            ];
        }

        // Si aucun pattern ne correspond, retourner la ligne brute
        return [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => 'info',
            'message' => $line,
            'raw' => $line,
            'level_color' => $this->getLevelColor('info')
        ];
    }

    /**
     * Filtrer les logs par niveau et recherche
     */
    private function filterLogs($logContent, $levelFilter, $searchQuery)
    {
        $lines = explode("\n", $logContent);
        $filtered = [];

        foreach ($lines as $index => $line) {
            $parsed = $this->parseLogLine($line);

            if (!$parsed) {
                continue;
            }

            // Filtrer par niveau
            if ($levelFilter !== 'all' && $parsed['level'] !== $levelFilter) {
                continue;
            }

            // Filtrer par recherche
            if (!empty($searchQuery)) {
                $searchLower = strtolower($searchQuery);
                $messageLower = strtolower($parsed['message']);
                $rawLower = strtolower($parsed['raw']);

                if (strpos($messageLower, $searchLower) === false &&
                    strpos($rawLower, $searchLower) === false) {
                    continue;
                }
            }

            $parsed['id'] = $index;
            $filtered[] = $parsed;
        }

        return $filtered;
    }

    /**
     * Obtenir les statistiques des logs
     */
    private function getLogStatistics($logs)
    {
        $levels = [
            'emergency' => 0,
            'alert' => 0,
            'critical' => 0,
            'error' => 0,
            'warning' => 0,
            'notice' => 0,
            'info' => 0,
            'debug' => 0,
            'other' => 0
        ];

        foreach ($logs as $log) {
            $level = strtolower($log['level']);
            if (isset($levels[$level])) {
                $levels[$level]++;
            } else {
                $levels['other']++;
            }
        }

        return [
            'total' => count($logs),
            'levels' => $levels,
            'start_date' => count($logs) > 0 ? $logs[0]['timestamp'] : null,
            'end_date' => count($logs) > 0 ? end($logs)['timestamp'] : null
        ];
    }

    /**
     * Obtenir la couleur pour un niveau de log
     */
    private function getLevelColor($level)
    {
        $colors = [
            'emergency' => 'bg-red-100 text-red-800',
            'alert' => 'bg-red-100 text-red-800',
            'critical' => 'bg-red-100 text-red-800',
            'error' => 'bg-red-100 text-red-800',
            'warning' => 'bg-yellow-100 text-yellow-800',
            'notice' => 'bg-blue-100 text-blue-800',
            'info' => 'bg-green-100 text-green-800',
            'debug' => 'bg-gray-100 text-gray-800'
        ];

        return $colors[$level] ?? 'bg-gray-100 text-gray-800';
    }

    /**
     * Formater les octets en format lisible
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Télécharger la base de données (backup)
     */
    public function downloadDatabase()
    {
        $filename = 'database_backup_' . date('Y-m-d_His') . '.sql';
        $path = storage_path('app/backups/' . $filename);

        // Créer le répertoire si nécessaire
        if (!File::exists(dirname($path))) {
            File::makeDirectory(dirname($path), 0755, true);
        }

        // Commande pour sauvegarder la base de données
        $command = sprintf(
            'mysqldump --user=%s --password=%s --host=%s %s > %s',
            config('database.connections.mysql.username'),
            config('database.connections.mysql.password'),
            config('database.connections.mysql.host'),
            config('database.connections.mysql.database'),
            $path
        );

        exec($command);

        if (!File::exists($path)) {
            return redirect()->back()->with('error', 'Échec de la sauvegarde de la base de données.');
        }

        return response()->download($path)->deleteFileAfterSend(true);
    }
}
