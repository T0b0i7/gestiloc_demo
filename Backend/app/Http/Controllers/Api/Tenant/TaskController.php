<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TaskController extends Controller
{
    private function getTenant()
    {
        $user = auth()->user();

        if (!$user || !$user->hasRole('tenant')) {
            return null;
        }

        return $user->tenant;
    }

    /**
     * GET /api/tenant/tasks - Liste des tâches
     */
    public function index(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $query = Task::where('tenant_id', $tenant->id)
                ->with(['property']);

            // Filtres
            if ($request->has('status')) {
                if ($request->status === 'active') {
                    $query->where('completed', false);
                } elseif ($request->status === 'completed') {
                    $query->where('completed', true);
                }
            }

            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }

            if ($request->has('property_id')) {
                $query->where('property_id', $request->property_id);
            }

            // Recherche
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $tasks = $query->orderBy('created_at', 'desc')->get();

            return response()->json($tasks);

        } catch (\Exception $e) {
            Log::error('Erreur index tasks: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors du chargement des tâches'
            ], 500);
        }
    }

    /**
     * POST /api/tenant/tasks - Créer une tâche
     */
    public function store(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'nullable|date',
                'priority' => 'required|in:low,medium,high',
                'property_id' => 'nullable|exists:properties,id',
                'assigned_to' => 'nullable|string|max:255',
            ]);

            $task = Task::create([
                'uuid' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'property_id' => $validated['property_id'] ?? null,
                'created_by' => auth()->id(),
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'due_date' => $validated['due_date'] ?? null,
                'priority' => $validated['priority'],
                'assigned_to' => $validated['assigned_to'] ?? 'me',
                'completed' => false,
            ]);

            Log::info('Tâche créée', [
                'task_id' => $task->id,
                'tenant_id' => $tenant->id
            ]);

            return response()->json($task, 201);

        } catch (\Exception $e) {
            Log::error('Erreur création tâche: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la création de la tâche'
            ], 500);
        }
    }

    /**
     * PUT /api/tenant/tasks/{id} - Mettre à jour une tâche
     */
    public function update(Request $request, $id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $task = Task::where('tenant_id', $tenant->id)->findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'nullable|date',
                'completed' => 'sometimes|boolean',
                'priority' => 'sometimes|in:low,medium,high',
                'property_id' => 'nullable|exists:properties,id',
                'assigned_to' => 'nullable|string|max:255',
            ]);

            $task->update($validated);

            return response()->json($task);

        } catch (\Exception $e) {
            Log::error('Erreur mise à jour tâche: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la tâche'
            ], 500);
        }
    }

    /**
     * DELETE /api/tenant/tasks/{id} - Supprimer une tâche
     */
    public function destroy($id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $task = Task::where('tenant_id', $tenant->id)->findOrFail($id);
            $task->delete();

            Log::info('Tâche supprimée', [
                'task_id' => $id,
                'tenant_id' => $tenant->id
            ]);

            return response()->json(['message' => 'Tâche supprimée avec succès']);

        } catch (\Exception $e) {
            Log::error('Erreur suppression tâche: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression de la tâche'
            ], 500);
        }
    }
}
