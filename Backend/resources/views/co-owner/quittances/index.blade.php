@extends('layouts.co-owner')

@section('title', 'Quittances de loyers')

@section('content')
<div style="min-height: 100vh; background: #F8F9FA; padding: 2rem;">
    <div style="max-width: 1400px; margin: 0 auto;">

        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h1 style="font-size: 1.8rem; font-weight: 700; color: #1F2937; margin: 0 0 0.5rem 0;">
                    Quittances de loyers
                </h1>
                <p style="color: #6B7280; font-size: 0.9rem; margin: 0; max-width: 600px;">
                    Créez et générez vos quittances de loyer après réception des paiements.<br>
                    Envoyez automatiquement les quittances à vos locataires.
                </p>
            </div>

            <a href="{{ route('co-owner.quittances.create') }}"
               class="btn-create"
               style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #70AE48; color: white; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(112, 174, 72, 0.3); transition: all 0.2s ease;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Créer une quittance de loyer</span>
            </a>
        </div>

        <!-- Statistiques -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid #E5E7EB; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <div style="color: #9CA3AF; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                    QUITTANCES ÉMISES
                </div>
                <div style="font-size: 2rem; font-weight: 700; color: #1F2937;">
                    {{ $totalReceipts }}
                </div>
            </div>

            <div style="background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid #E5E7EB; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <div style="color: #9CA3AF; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                    CE MOIS-CI
                </div>
                <div style="font-size: 2rem; font-weight: 700; color: #70AE48;">
                    {{ $thisMonthReceipts }}
                </div>
            </div>

            <div style="background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid #E5E7EB; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <div style="color: #9CA3AF; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                    EN ATTENTE D'ENVOI
                </div>
                <div style="font-size: 2rem; font-weight: 700; color: #F59E0B;">
                    {{ $pendingReceipts }}
                </div>
            </div>

            <div style="background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid #E5E7EB; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <div style="color: #9CA3AF; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                    TOTAL ENCAISSÉ
                </div>
                <div style="font-size: 2rem; font-weight: 700; color: #70AE48;">
                    {{ number_format($totalCollected * 655, 0, ',', ' ') }} FCFA
                </div>
            </div>
        </div>

        <!-- Formulaire de filtres -->
        <form method="GET" action="{{ route('co-owner.quittances.index') }}" id="filter-form">
            <!-- Filtres statut -->
            <div style="display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap;">
                <button type="submit" name="status" value="all"
                        class="filter-btn {{ $statusFilter === 'all' ? 'active' : '' }}"
                        style="padding: 10px 24px; border: none; border-radius: 30px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; background: {{ $statusFilter === 'all' ? '#70AE48' : '#E5E7EB' }}; color: {{ $statusFilter === 'all' ? 'white' : '#6B7280' }};">
                    Tous
                </button>
                <button type="submit" name="status" value="sent"
                        class="filter-btn {{ $statusFilter === 'sent' ? 'active' : '' }}"
                        style="padding: 10px 24px; border: none; border-radius: 30px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; background: {{ $statusFilter === 'sent' ? '#70AE48' : '#E5E7EB' }}; color: {{ $statusFilter === 'sent' ? 'white' : '#6B7280' }};">
                    Envoyées
                </button>
                <button type="submit" name="status" value="pending"
                        class="filter-btn {{ $statusFilter === 'pending' ? 'active' : '' }}"
                        style="padding: 10px 24px; border: none; border-radius: 30px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; background: {{ $statusFilter === 'pending' ? '#70AE48' : '#E5E7EB' }}; color: {{ $statusFilter === 'pending' ? 'white' : '#6B7280' }};">
                    En attente
                </button>
                <button type="submit" name="status" value="year"
                        class="filter-btn {{ $statusFilter === 'year' ? 'active' : '' }}"
                        style="padding: 10px 24px; border: none; border-radius: 30px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; background: {{ $statusFilter === 'year' ? '#70AE48' : '#E5E7EB' }}; color: {{ $statusFilter === 'year' ? 'white' : '#6B7280' }};">
                    Par année
                </button>
            </div>

            <!-- Zone de recherche et filtre -->
            <div style="background: white; border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid #E5E7EB;">
                <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 250px;">
                        <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                            FILTRER PAR BIEN
                        </label>
                        <select name="property_id" onchange="document.getElementById('filter-form').submit()"
                                style="width: 100%; padding: 12px 16px; border: 1px solid #E5E7EB; border-radius: 12px; font-size: 0.9rem; color: #1F2937; background: white; cursor: pointer; transition: all 0.2s;"
                                onfocus="this.style.borderColor='#70AE48'; this.style.boxShadow='0 0 0 3px rgba(112, 174, 72, 0.1)'"
                                onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none'">
                            <option value="">Tous les biens</option>
                            @foreach($properties as $property)
                                <option value="{{ $property->id }}" {{ $propertyFilter == $property->id ? 'selected' : '' }}>
                                    {{ $property->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div style="flex: 1; min-width: 250px;">
                        <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                            RECHERCHER
                        </label>
                        <div style="position: relative;">
                            <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9CA3AF; width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <input type="text" name="search" value="{{ $searchTerm }}" placeholder="Locataire, bien, mois..."
                                   style="width: 100%; padding: 12px 16px 12px 42px; border: 1px solid #E5E7EB; border-radius: 12px; font-size: 0.9rem; color: #1F2937; transition: all 0.2s;"
                                   onfocus="this.style.borderColor='#70AE48'; this.style.boxShadow='0 0 0 3px rgba(112, 174, 72, 0.1)'"
                                   onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none'">
                        </div>
                    </div>

                    <div style="flex: 0 0 auto;">
                        <button type="submit"
                                style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: #70AE48; color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(112, 174, 72, 0.2);"
                                onmouseover="this.style.background='#5d8f3a'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(112, 174, 72, 0.3)'"
                                onmouseout="this.style.background='#70AE48'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(112, 174, 72, 0.2)'">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            Rechercher
                        </button>
                    </div>
                </div>
            </div>
        </form>

        @if(session('success'))
            <div style="background: rgba(112, 174, 72, 0.1); border: 1px solid #70AE48; border-radius: 16px; padding: 1rem 1.5rem; margin-bottom: 2rem; display: flex; align-items: start; gap: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#70AE48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                    <strong style="color: #2e5e1e; font-weight: 600; display: block; margin-bottom: 4px;">Succès !</strong>
                    <p style="color: #3d7526; margin: 0; font-size: 0.9rem;">{{ session('success') }}</p>
                </div>
            </div>
        @endif

        <!-- Grille des quittances -->
        @if($receipts->isEmpty())
            <div style="text-align: center; padding: 4rem 2rem; background: white; border-radius: 20px; border: 2px dashed #E5E7EB;">
                <svg style="width: 64px; height: 64px; color: #D1D5DB; margin: 0 auto 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 style="font-size: 1.2rem; font-weight: 700; color: #6B7280; margin: 0 0 0.5rem 0;">
                    Aucune quittance trouvée
                </h3>
                <p style="color: #9CA3AF; margin: 0 0 1.5rem 0;">
                    @if($searchTerm || $propertyFilter || $statusFilter !== 'all')
                        Aucune quittance ne correspond à vos critères de recherche.
                    @else
                        Commencez par créer votre première quittance.
                    @endif
                </p>
                @if(!$searchTerm && !$propertyFilter && $statusFilter === 'all')
                    <a href="{{ route('co-owner.quittances.create') }}"
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: #70AE48; color: white; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(112, 174, 72, 0.3); transition: all 0.2s;"
                       onmouseover="this.style.background='#5d8f3a'; this.style.transform='translateY(-1px)'"
                       onmouseout="this.style.background='#70AE48'; this.style.transform='translateY(0)'">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Créer une quittance
                    </a>
                @else
                    <a href="{{ route('co-owner.quittances.index') }}"
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: #6B7280; color: white; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: all 0.2s;"
                       onmouseover="this.style.background='#4B5563'"
                       onmouseout="this.style.background='#6B7280'">
                        Réinitialiser les filtres
                    </a>
                @endif
            </div>
        @else
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem;">
                @foreach($receipts as $receipt)
                    <div style="background: white; border-radius: 20px; padding: 1.5rem; border: 1px solid #E5E7EB; transition: all 0.3s ease; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.02);"
                         onmouseover="this.style.boxShadow='0 8px 24px rgba(112, 174, 72, 0.15)'; this.style.transform='translateY(-2px)'; this.style.borderColor='#70AE48'"
                         onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.02)'; this.style.transform='translateY(0)'; this.style.borderColor='#E5E7EB'">

                        <!-- Header de la carte -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                @if($receipt->status == 'issued')
                                    <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(112, 174, 72, 0.1); border-radius: 30px;">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#70AE48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span style="color: #70AE48; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Envoyée</span>
                                    </div>
                                @elseif($receipt->status == 'pending')
                                    <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(245, 158, 11, 0.1); border-radius: 30px;">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        <span style="color: #F59E0B; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">En attente</span>
                                    </div>
                                @endif
                            </div>
                            <span style="color: #9CA3AF; font-size: 0.7rem; font-weight: 500;">
                                {{ \Carbon\Carbon::parse($receipt->created_at)->format('d/m/Y') }}
                            </span>
                        </div>

                        <!-- Titre et locataire -->
                        <h3 style="font-size: 1.2rem; font-weight: 700; color: #1F2937; margin: 0 0 0.75rem 0;">
                            Quittance {{ \Carbon\Carbon::parse($receipt->paid_month . '-01')->locale('fr')->translatedFormat('F Y') }}
                        </h3>

                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 1.5rem;">
                            <div style="width: 32px; height: 32px; background: rgba(112, 174, 72, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#70AE48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <div>
                                <div style="font-weight: 600; color: #1F2937;">{{ $receipt->tenant->first_name ?? '' }} {{ $receipt->tenant->last_name ?? '' }}</div>
                                <div style="color: #9CA3AF; font-size: 0.8rem;">{{ $receipt->property->city ?? '' }}</div>
                            </div>
                        </div>

                        <!-- Détails financiers -->
                        <div style="background: #F9FAFB; border-radius: 14px; padding: 1rem; margin-bottom: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                <span style="color: #6B7280; font-size: 0.8rem;">Loyer</span>
                                <span style="font-weight: 600; color: #1F2937;">{{ number_format(($receipt->amount_paid - ($receipt->lease->charges_amount ?? 0)) * 655, 0, ',', ' ') }} FCFA</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                <span style="color: #6B7280; font-size: 0.8rem;">Charges</span>
                                <span style="font-weight: 600; color: #1F2937;">{{ number_format(($receipt->lease->charges_amount ?? 0) * 655, 0, ',', ' ') }} FCFA</span>
                            </div>
                            <div style="height: 1px; background: #E5E7EB; margin: 0.75rem 0;"></div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: #6B7280; font-size: 0.8rem; font-weight: 600;">Total payé</span>
                                <span style="font-size: 1.2rem; font-weight: 700; color: #70AE48;">{{ number_format($receipt->amount_paid * 655, 0, ',', ' ') }} FCFA</span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div style="display: flex; gap: 0.5rem;">
                            <a href="{{ route('co-owner.quittances.download', $receipt->id) }}"
                               style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; background: white; color: #6B7280; border: 1px solid #E5E7EB; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 0.85rem; transition: all 0.2s;"
                               onmouseover="this.style.background='#F9FAFB'; this.style.borderColor='#70AE48'; this.style.color='#70AE48'"
                               onmouseout="this.style.background='white'; this.style.borderColor='#E5E7EB'; this.style.color='#6B7280'">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Télécharger
                            </a>

                            <form action="{{ route('co-owner.quittances.send-email', $receipt->id) }}" method="POST" style="flex: 1;">
                                @csrf
                                <button type="submit"
                                        style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; background: white; color: #6B7280; border: 1px solid #E5E7EB; border-radius: 12px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;"
                                        onmouseover="this.style.background='#F9FAFB'; this.style.borderColor='#70AE48'; this.style.color='#70AE48'"
                                        onmouseout="this.style.background='white'; this.style.borderColor='#E5E7EB'; this.style.color='#6B7280'">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                    Envoyer
                                </button>
                            </form>

                            <form action="{{ route('co-owner.quittances.destroy', $receipt->id) }}" method="POST" onsubmit="return confirm('Êtes-vous sûr de vouloir supprimer cette quittance ?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit"
                                        style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; background: white; color: #EF4444; border: 1px solid #FCA5A5; border-radius: 12px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;"
                                        onmouseover="this.style.background='#FEF2F2'; this.style.borderColor='#EF4444'"
                                        onmouseout="this.style.background='white'; this.style.borderColor='#FCA5A5'">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0h10"></path>
                                        <path d="M10 11v5"></path>
                                        <path d="M14 11v5"></path>
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Pagination -->
            @if($receipts->hasPages())
                <div style="margin-top: 3rem; display: flex; justify-content: center;">
                    {{ $receipts->appends(request()->query())->links() }}
                </div>
            @endif
        @endif
    </div>
</div>

    <script>
        // Initialiser les icônes
        lucide.createIcons();

        // Fonction UNIFIÉE - React sur 8080, Laravel sur 8000
        function goToReact(path) {
            const token = localStorage.getItem('token') || getUrlParam('api_token');

            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }

            // Déterminer si c'est une route React ou Laravel
            const isLaravelRoute = path.includes('/tenants') ||
                                  path.includes('/assign-property') ||
                                  path.includes('/leases') ||
                                  path.includes('/notices') ||
                                  path.includes('/quittances') ||
                                  path.includes('/test-laravel');

            let baseUrl = 'http://localhost:';

            if (isLaravelRoute) {
                baseUrl += '8000'; // Laravel
            } else {
                baseUrl += '8080'; // React
            }

            let fullUrl = baseUrl + path;

            const separator = fullUrl.includes('?') ? '&' : '?';
            fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

            console.log('Navigation vers:', fullUrl);
            window.location.href = fullUrl;
        }

        // Pour les routes Laravel
        function navigateTo(path) {
            const token = localStorage.getItem('token') || getUrlParam('api_token');

            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }

            const baseUrl = 'https://wheat-skunk-120710.hostingersite.com';
            let fullUrl = baseUrl + path;

            const separator = fullUrl.includes('?') ? '&' : '?';
            fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

            console.log('Navigation Laravel vers:', fullUrl);
            window.location.href = fullUrl;
        }

        // Helper pour récupérer un paramètre d'URL
        function getUrlParam(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        }

        // Gestion des sous-menus
        function toggleSubmenu(menuId) {
            const submenu = document.getElementById(menuId);
            const parent = document.querySelector(`[onclick="toggleSubmenu('${menuId}')"]`);

            if (submenu.style.display === 'none' || !submenu.style.display) {
                submenu.style.display = 'block';
                parent.classList.add('active');
            } else {
                submenu.style.display = 'none';
                parent.classList.remove('active');
            }
        }

        // Gestion de la sidebar mobile
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');

            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        document.getElementById('overlay').addEventListener('click', toggleSidebar);

        // Logout
        function logout() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/logout';
            }
        }

        // Au chargement
        function checkMobile() {
            const mobileBtn = document.querySelector('.mobile-menu-btn');
            if (window.innerWidth <= 768) {
                mobileBtn.style.display = 'block';
            } else {
                mobileBtn.style.display = 'none';
            }
        }

        window.addEventListener('resize', checkMobile);
        checkMobile();

        // Ajouter le token à la page actuelle si présent dans l'URL
        const urlToken = getUrlParam('api_token');
        if (urlToken) {
            localStorage.setItem('token', urlToken);
        }

        // Actualiser les données
        function refreshData() {
            const button = event.currentTarget;
            const originalHtml = button.innerHTML;

            button.innerHTML = '<i data-lucide="loader" style="width: 16px; height: 16px; animation: spin 1s linear infinite;"></i> Actualisation...';
            button.disabled = true;

            setTimeout(() => {
                window.location.reload();
            }, 500);
        }

        // Ajouter l'animation de spin pour le loader
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    </script>

    <script>
    // Initialiser les icônes
    lucide.createIcons();

    // Navigation vers React (8080)
    function goToReact(path) {
        const token = localStorage.getItem('token') || getUrlParam('api_token');

        if (!token) {
            alert('Session expirée, veuillez vous reconnecter');
            window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
            return;
        }

        const baseUrl = 'http://localhost:8080';
        let fullUrl = baseUrl + path;

        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

        console.log('Navigation React vers:', fullUrl);
        window.location.href = fullUrl;
    }

    // Navigation vers Laravel (8000)
    function navigateTo(path) {
        const token = localStorage.getItem('token') || getUrlParam('api_token');

        if (!token) {
            alert('Session expirée, veuillez vous reconnecter');
            window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
            return;
        }

        const baseUrl = 'https://wheat-skunk-120710.hostingersite.com';
        let fullUrl = baseUrl + path;

        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

        console.log('Navigation Laravel vers:', fullUrl);
        window.location.href = fullUrl;
    }

    .pagination li a, .pagination li span {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 40px;
        height: 40px;
        padding: 0 0.5rem;
        background: white;
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        color: #6B7280;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s;
    }

    .pagination li.active span {
        background: #70AE48;
        border-color: #70AE48;
        color: white;
    }

    .pagination li a:hover {
        background: #F9FAFB;
        border-color: #70AE48;
        color: #70AE48;
    }
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Hover effect for create button
    const createBtn = document.querySelector('.btn-create');
    if (createBtn) {
        createBtn.addEventListener('mouseover', function() {
            this.style.background = '#5d8f3a';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 16px rgba(112, 174, 72, 0.4)';
        });
        createBtn.addEventListener('mouseout', function() {
            this.style.background = '#70AE48';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(112, 174, 72, 0.3)';
        });
    }

    // Logout
    function logout() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'https://wheat-skunk-120710.hostingersite.com/logout';
        }
    }

    // Au chargement
    function checkMobile() {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        if (window.innerWidth <= 768) {
            mobileBtn.style.display = 'block';
        } else {
            mobileBtn.style.display = 'none';
        }
    }

    window.addEventListener('resize', checkMobile);
    checkMobile();

    // Ajouter le token à la page actuelle si présent dans l'URL
    const urlToken = getUrlParam('api_token');
    if (urlToken) {
        localStorage.setItem('token', urlToken);
    }

    // Marquer le menu actif en fonction de la page courante
    document.addEventListener('DOMContentLoaded', function() {
        const currentPath = window.location.pathname;

        // Définir quel sous-menu doit être ouvert par défaut
        const menuConfig = {
            '/coproprietaire/tenants': 'locative-menu',
            '/coproprietaire/tenants/create': 'locative-menu',
            '/coproprietaire/assign-property/create': 'locative-menu',
            '/coproprietaire/leases': 'locative-menu',
            '/coproprietaire/quittances': 'locative-menu',
            '/coproprietaire/notices': 'locative-menu',
            '/coproprietaire/maintenance': 'locative-menu',
            '/coproprietaire/biens': 'biens-menu',
            '/coproprietaire/delegations': 'biens-menu',
            '/coproprietaire/documents': 'documents-menu',
            '/coproprietaire/finances': 'documents-menu',
            '/coproprietaire/profile': 'profile-menu',
            '/coproprietaire/parametres': 'profile-menu',
            '/coproprietaire/audit': 'profile-menu',
            '/coproprietaire/mes-delegations': 'delegations-menu',
            '/coproprietaire/demandes-delegation': 'delegations-menu',
            '/coproprietaire/inviter-proprietaire': 'delegations-menu',
            '/coproprietaire/emettre-paiement': 'finances-menu',
            '/coproprietaire/retrait-methode': 'finances-menu',
            '/admin/statistiques': 'admin-menu',
            '/admin/logs': 'admin-menu'
        };

        // Ouvrir le sous-menu approprié
        for (const [path, menuId] of Object.entries(menuConfig)) {
            if (currentPath.includes(path)) {
                setTimeout(() => toggleSubmenu(menuId), 100);
                break;
            }
        }

        // Marquer l'élément actif
        document.querySelectorAll('.submenu-item').forEach(item => {
            const itemPath = item.getAttribute('onclick');
            if (itemPath && itemPath.includes(currentPath)) {
                item.classList.add('active');
            }
        });
    });
});
</script>
@endsection
