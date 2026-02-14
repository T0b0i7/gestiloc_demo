<div style="padding: 1.5rem; max-width: 100%;">
    <!-- En-tête spectaculaire avec dégradé animé -->
    <div style="position: relative; overflow: hidden; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%); border-radius: 1.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); padding: 2.5rem; margin-bottom: 1.5rem;">
        <div style="position: relative; z-index: 10;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                    <div style="width: 5rem; height: 5rem; border-radius: 1rem; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                        <i data-lucide="file-search" style="width: 2.5rem; height: 2.5rem; color: white;"></i>
                    </div>
                    <div>
                        <h3 style="font-size: 2.25rem; font-weight: 900; color: white; margin-bottom: 0.5rem; letter-spacing: -0.025em;">Analyse du Log</h3>
                        <p style="color: rgba(233, 213, 255, 1); font-size: 1rem; font-weight: 500;">Vue détaillée et complète de l'entrée</p>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem;">
                    <span class="badge-{{ $log['details']['level'] ?? 'info' }}" style="padding: 0.75rem 2rem; border-radius: 9999px; font-size: 1rem; font-weight: 700; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); backdrop-filter: blur(4px); border: 2px solid rgba(255, 255, 255, 0.3);">
                        {{ strtoupper($log['details']['level'] ?? 'INFO') }}
                    </span>
                    <span style="color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 500;">Ligne #{{ $logId }}</span>
                </div>
            </div>

            <!-- Métriques colorées -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.25rem; margin-top: 2rem;">
                <div style="background: linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%); backdrop-filter: blur(12px); border-radius: 1rem; padding: 1.25rem; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); transition: transform 0.3s;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                        <div style="width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; background: #22d3ee; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <i data-lucide="file-text" style="width: 1.25rem; height: 1.25rem; color: white;"></i>
                        </div>
                        <span style="color: rgba(207, 250, 254, 1); font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Fichier Source</span>
                    </div>
                    <p style="color: white; font-weight: 700; font-size: 1.125rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ $filename }}</p>
                </div>

                <div style="background: linear-gradient(135deg, rgba(244, 114, 182, 0.2) 0%, rgba(251, 113, 133, 0.2) 100%); backdrop-filter: blur(12px); border-radius: 1rem; padding: 1.25rem; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); transition: transform 0.3s;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                        <div style="width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; background: #f472b6; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <i data-lucide="hash" style="width: 1.25rem; height: 1.25rem; color: white;"></i>
                        </div>
                        <span style="color: rgba(252, 231, 243, 1); font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Identifiant</span>
                    </div>
                    <p style="color: white; font-weight: 700; font-size: 1.125rem;">#{{ $logId }}</p>
                </div>

                <div style="background: linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%); backdrop-filter: blur(12px); border-radius: 1rem; padding: 1.25rem; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); transition: transform 0.3s;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                        <div style="width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; background: #34d399; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <i data-lucide="clock" style="width: 1.25rem; height: 1.25rem; color: white;"></i>
                        </div>
                        <span style="color: rgba(209, 250, 229, 1); font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Horodatage</span>
                    </div>
                    <p style="color: white; font-weight: 700; font-size: 0.875rem;">{{ isset($log['details']['timestamp']) ? substr($log['details']['timestamp'], 0, 16) : 'N/A' }}</p>
                </div>
            </div>
        </div>
    </div>

    @if($log && isset($log['details']))
    <!-- Grille d'informations avec disposition gauche-droite -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <!-- Colonne Gauche -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Carte Timestamp -->
            <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden; border: 2px solid #99f6e4;">
                <div style="background: linear-gradient(90deg, #14b8a6 0%, #06b6d4 100%); padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 3rem; height: 3rem; border-radius: 0.75rem; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="clock" style="width: 1.5rem; height: 1.5rem; color: white;"></i>
                        </div>
                        <div>
                            <h4 style="font-size: 1.125rem; font-weight: 900; color: white; margin: 0;">Horodatage</h4>
                            <p style="color: rgba(204, 251, 241, 1); font-size: 0.875rem; margin: 0;">Date et heure précises</p>
                        </div>
                    </div>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="font-size: 0.875rem; color: #0f766e; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Timestamp Complet</div>
                    <div style="font-family: monospace; font-size: 1.125rem; font-weight: 700; color: #134e4a; background: white; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #5eead4; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);">
                        {{ $log['details']['timestamp'] ?? 'N/A' }}
                    </div>
                </div>
            </div>

            <!-- Carte Niveau de sévérité -->
            <div style="background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%); border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden; border: 2px solid #fdba74;">
                <div style="background: linear-gradient(90deg, #f97316 0%, #dc2626 100%); padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 3rem; height: 3rem; border-radius: 0.75rem; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="layers" style="width: 1.5rem; height: 1.5rem; color: white;"></i>
                        </div>
                        <div>
                            <h4 style="font-size: 1.125rem; font-weight: 900; color: white; margin: 0;">Niveau</h4>
                            <p style="color: rgba(254, 215, 170, 1); font-size: 0.875rem; margin: 0;">Degré de sévérité</p>
                        </div>
                    </div>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="font-size: 0.875rem; color: #c2410c; font-weight: 600; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Sévérité du Log</div>
                    <div style="text-align: center;">
                        <span class="badge-{{ $log['details']['level'] ?? 'info' }}" style="display: inline-block; padding: 1rem 2rem; border-radius: 1rem; font-size: 1.125rem; font-weight: 900; text-transform: uppercase; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border: 2px solid rgba(255, 255, 255, 0.5);">
                            {{ $log['details']['level'] ?? 'INFO' }}
                        </span>
                    </div>
                </div>
            </div>

            @if(isset($log['details']['environment']))
            <!-- Carte Environnement -->
            <div style="background: linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%); border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden; border: 2px solid #d8b4fe;">
                <div style="background: linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%); padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 3rem; height: 3rem; border-radius: 0.75rem; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="globe" style="width: 1.5rem; height: 1.5rem; color: white;"></i>
                        </div>
                        <div>
                            <h4 style="font-size: 1.125rem; font-weight: 900; color: white; margin: 0;">Environnement</h4>
                            <p style="color: rgba(233, 213, 255, 1); font-size: 0.875rem; margin: 0;">Contexte d'exécution</p>
                        </div>
                    </div>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="font-size: 0.875rem; color: #7c3aed; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Type d'environnement</div>
                    <div style="font-family: monospace; font-size: 1.125rem; font-weight: 700; color: #581c87; background: white; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #c4b5fd; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);">
                        {{ ucfirst($log['details']['environment']) }}
                    </div>
                </div>
            </div>
            @endif
        </div>

        <!-- Colonne Droite -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Carte Fichier Source -->
            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden; border: 2px solid #93c5fd;">
                <div style="background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%); padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 3rem; height: 3rem; border-radius: 0.75rem; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="file-text" style="width: 1.5rem; height: 1.5rem; color: white;"></i>
                        </div>
                        <div>
                            <h4 style="font-size: 1.125rem; font-weight: 900; color: white; margin: 0;">Fichier Source</h4>
                            <p style="color: rgba(219, 234, 254, 1); font-size: 0.875rem; margin: 0;">Origine du log</p>
                        </div>
                    </div>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="font-size: 0.875rem; color: #1e40af; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Nom du Fichier</div>
                    <div style="font-family: monospace; font-size: 1rem; font-weight: 700; color: #1e3a8a; background: white; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #93c5fd; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); word-break: break-all;">
                        {{ $filename }}
                    </div>
                </div>
            </div>

            <!-- Carte Identifiant -->
            <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden; border: 2px solid #f9a8d4;">
                <div style="background: linear-gradient(90deg, #ec4899 0%, #f43f5e 100%); padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 3rem; height: 3rem; border-radius: 0.75rem; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="hash" style="width: 1.5rem; height: 1.5rem; color: white;"></i>
                        </div>
                        <div>
                            <h4 style="font-size: 1.125rem; font-weight: 900; color: white; margin: 0;">Identifiant</h4>
                            <p style="color: rgba(251, 207, 232, 1); font-size: 0.875rem; margin: 0;">ID de la ligne</p>
                        </div>
                    </div>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="font-size: 0.875rem; color: #be185d; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Numéro de Ligne</div>
                    <div style="font-family: monospace; font-size: 2rem; font-weight: 900; color: #831843; background: white; padding: 1rem; border-radius: 0.75rem; border: 2px solid #f9a8d4; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); text-align: center;">
                        #{{ $logId }}
                    </div>
                </div>
            </div>

            <!-- Carte statistiques supplémentaires -->
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden; border: 2px solid #86efac;">
                <div style="background: linear-gradient(90deg, #10b981 0%, #22c55e 100%); padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 3rem; height: 3rem; border-radius: 0.75rem; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="bar-chart" style="width: 1.5rem; height: 1.5rem; color: white;"></i>
                        </div>
                        <div>
                            <h4 style="font-size: 1.125rem; font-weight: 900; color: white; margin: 0;">Statistiques</h4>
                            <p style="color: rgba(209, 250, 229, 1); font-size: 0.875rem; margin: 0;">Informations du log</p>
                        </div>
                    </div>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span style="color: #047857; font-weight: 600;">Taille</span>
                        <span style="font-family: monospace; font-weight: 700; color: #065f46;">{{ strlen($log['content']) }} caractères</span>
                    </div>
                    <div style="height: 1px; background: #a7f3d0; margin-bottom: 1rem;"></div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #047857; font-weight: 600;">Type</span>
                        <span style="font-family: monospace; font-weight: 700; color: #065f46;">{{ strtoupper($log['details']['level'] ?? 'LOG') }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Message du log - Pleine largeur avec terminal design -->
    <div style="background: white; border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; border: 2px solid #e5e7eb; margin-bottom: 1.5rem;">
        <div style="background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); padding: 1.5rem 2rem;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 3.5rem; height: 3.5rem; border-radius: 1rem; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                        <i data-lucide="message-square" style="width: 1.75rem; height: 1.75rem; color: white;"></i>
                    </div>
                    <div>
                        <h4 style="font-size: 1.5rem; font-weight: 900; color: white; margin: 0;">Message Détaillé</h4>
                        <p style="color: rgba(233, 213, 255, 1); font-size: 0.875rem; font-weight: 500; margin: 0;">Contenu principal de l'entrée de log</p>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <div style="width: 1rem; height: 1rem; border-radius: 50%; background: #f87171; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></div>
                    <div style="width: 1rem; height: 1rem; border-radius: 50%; background: #fbbf24; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></div>
                    <div style="width: 1rem; height: 1rem; border-radius: 50%; background: #34d399; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></div>
                </div>
            </div>
        </div>
        <div style="padding: 2rem;">
            <div style="border-radius: 1rem; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(90deg, #1f2937 0%, #111827 100%); padding: 0.75rem 1.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <i data-lucide="terminal" style="width: 1rem; height: 1rem; color: #34d399;"></i>
                        <span style="font-size: 0.75rem; color: #9ca3af; font-family: monospace; font-weight: 600;">log-message.terminal</span>
                    </div>
                    <span style="font-size: 0.75rem; color: #6b7280; font-family: monospace;">UTF-8</span>
                </div>
                <div style="background: linear-gradient(135deg, #0f172a 0%, #020617 100%); padding: 2rem; font-family: monospace; font-size: 0.875rem; min-height: 12.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: #22d3ee; margin-bottom: 1rem; font-weight: 700;">
                        <span style="color: #34d399;">→</span>
                        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;">MESSAGE:</span>
                    </div>
                    <div style="color: #86efac; white-space: pre-wrap; line-height: 1.75; font-size: 1rem;">{{ $log['details']['message'] ?? $log['content'] }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Contenu brut - Pleine largeur -->
    <div style="background: white; border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; border: 2px solid #e5e7eb; margin-bottom: 1.5rem;">
        <div style="background: linear-gradient(90deg, #64748b 0%, #475569 100%); padding: 1.5rem 2rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 3.5rem; height: 3.5rem; border-radius: 1rem; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                        <i data-lucide="code" style="width: 1.75rem; height: 1.75rem; color: white;"></i>
                    </div>
                    <div>
                        <h4 style="font-size: 1.5rem; font-weight: 900; color: white; margin: 0;">Contenu Brut</h4>
                        <p style="color: rgba(226, 232, 240, 1); font-size: 0.875rem; font-weight: 500; margin: 0;">Ligne complète non formatée du fichier de log</p>
                    </div>
                </div>
                <button onclick="copyRawContent()" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(12px); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 0.75rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); font-weight: 700;">
                    <i data-lucide="copy" style="width: 1.25rem; height: 1.25rem;"></i>
                    <span>Copier</span>
                </button>
            </div>
        </div>
        <div style="padding: 2rem;">
            <div style="border-radius: 1rem; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(90deg, #334155 0%, #1e293b 100%); padding: 0.75rem 1.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #475569;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <i data-lucide="file-code" style="width: 1rem; height: 1rem; color: #22d3ee;"></i>
                        <span style="font-size: 0.75rem; color: #94a3b8; font-family: monospace; font-weight: 600;">raw-content.log</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <div style="width: 0.75rem; height: 0.75rem; border-radius: 50%; background: #ef4444;"></div>
                        <div style="width: 0.75rem; height: 0.75rem; border-radius: 50%; background: #eab308;"></div>
                        <div style="width: 0.75rem; height: 0.75rem; border-radius: 50%; background: #22c55e;"></div>
                    </div>
                </div>
                <div style="background: linear-gradient(135deg, #0f172a 0%, #020617 100%); padding: 2rem; font-family: monospace; font-size: 0.75rem; min-height: 9.375rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: #fbbf24; margin-bottom: 1rem; font-weight: 700;">
                        <span style="color: #22d3ee;">$</span>
                        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;">RAW CONTENT:</span>
                    </div>
                    <div style="color: #cbd5e1; white-space: pre-wrap; line-height: 1.6;">{{ $log['content'] }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Actions finales avec design premium -->
    <div style="background: linear-gradient(90deg, #f9fafb 0%, #e5e7eb 100%); border-radius: 1.5rem; padding: 2rem; border: 2px solid #d1d5db; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 3rem; height: 3rem; border-radius: 0.75rem; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <i data-lucide="info" style="width: 1.5rem; height: 1.5rem; color: white;"></i>
                </div>
                <div>
                    <p style="font-size: 0.875rem; color: #6b7280; font-weight: 500; margin: 0;">Entrée de log</p>
                    <p style="font-size: 1rem; color: #111827; font-weight: 700; margin: 0;">
                        Ligne <span style="color: #6366f1;">#{{ $logId }}</span>
                        <span style="color: #9ca3af; margin: 0 0.5rem;">•</span>
                        <span style="font-family: monospace; font-size: 0.875rem;">{{ $filename }}</span>
                    </p>
                </div>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button onclick="copyToClipboard('{{ addslashes($log['content']) }}')" style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: white; border: 2px solid #d1d5db; color: #374151; border-radius: 1rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); font-weight: 700;">
                    <i data-lucide="copy" style="width: 1.25rem; height: 1.25rem;"></i>
                    Copier le log
                </button>
                <button onclick="closeModal()" style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); border: none; color: white; border-radius: 1rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); font-weight: 700;">
                    <i data-lucide="check" style="width: 1.25rem; height: 1.25rem;"></i>
                    Fermer
                </button>
            </div>
        </div>
    </div>

    @else
    <!-- État vide ultra design -->
    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border: 2px solid #fca5a5; padding: 4rem; text-align: center;">
        <div style="position: relative; display: inline-block; margin-bottom: 2rem;">
            <div style="width: 8rem; height: 8rem; border-radius: 1.5rem; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); transform: rotate(6deg);">
                <i data-lucide="alert-triangle" style="width: 4rem; height: 4rem; color: white;"></i>
            </div>
            <div style="position: absolute; top: -0.5rem; right: -0.5rem; width: 3rem; height: 3rem; background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
                <span style="color: white; font-weight: 900; font-size: 1.5rem;">!</span>
            </div>
        </div>
        <h4 style="font-size: 2.25rem; font-weight: 900; color: #111827; margin-bottom: 1rem; background: linear-gradient(90deg, #dc2626 0%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Log Introuvable</h4>
        <p style="color: #374151; margin-bottom: 2.5rem; max-width: 32rem; margin-left: auto; margin-right: auto; font-size: 1.125rem; line-height: 1.75;">
            L'entrée de log demandée n'existe pas ou son format est invalide. Veuillez vérifier les paramètres et réessayer.
        </p>
        <button onclick="closeModal()" style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1.25rem 2.5rem; background: linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%); border: none; color: white; border-radius: 1rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); font-weight: 700; font-size: 1.125rem;">
            <i data-lucide="arrow-left" style="width: 1.5rem; height: 1.5rem;"></i>
            Retour à la liste
        </button>
    </div>
    @endif
</div>

<style>
    .badge-error, .badge-critical {
        background: linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #f97316 100%);
        color: white;
    }

    .badge-warning {
        background: linear-gradient(90deg, #eab308 0%, #f59e0b 50%, #ef4444 100%);
        color: white;
    }

    .badge-info {
        background: linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%);
        color: white;
    }

    .badge-debug {
        background: linear-gradient(90deg, #6b7280 0%, #64748b 50%, #52525b 100%);
        color: white;
    }

    .badge-success {
        background: linear-gradient(90deg, #10b981 0%, #34d399 50%, #14b8a6 100%);
        color: white;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: .5;
        }
    }

    button:hover {
        transform: scale(1.05);
        opacity: 0.9;
    }
</style>

<script>
    function copyRawContent() {
        const content = `{{ addslashes($log['content']) }}`;
        navigator.clipboard.writeText(content)
            .then(() => showNotification('Contenu copié avec succès !', 'success'))
            .catch(err => {
                console.error('Erreur:', err);
                showNotification('Erreur lors de la copie', 'error');
            });
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => showNotification('Log copié avec succès !', 'success'))
            .catch(err => {
                console.error('Erreur:', err);
                showNotification('Erreur lors de la copie', 'error');
            });
    }

    function showNotification(message, type = 'success') {
        const colors = {
            success: 'linear-gradient(90deg, #10b981 0%, #22c55e 50%, #14b8a6 100%)',
            error: 'linear-gradient(90deg, #ef4444 0%, #f97316 50%, #ec4899 100%)'
        };
        const icons = {
            success: 'check-circle',
            error: 'x-circle'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${colors[type]};
            color: white;
            padding: 1.25rem 2rem;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 1rem;
            border: 2px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(12px);
            animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        notification.innerHTML = `
            <div style="width: 2.5rem; height: 2.5rem; background: rgba(255, 255, 255, 0.3); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
                <i data-lucide="${icons[type]}" style="width: 1.5rem; height: 1.5rem;"></i>
            </div>
            <span style="font-weight: 700; font-size: 1.125rem;">${message}</span>
        `;

        document.body.appendChild(notification);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            notification.style.transition = 'all 0.3s';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
</script>

<style>
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
</style>
