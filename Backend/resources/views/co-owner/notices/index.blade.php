@extends('layouts.co-owner')

@section('title', 'Préavis de loyers')

@section('content')
<div style="min-height: 100vh; background: #F8F9FA; padding: 2rem;">
    <div style="max-width: 1400px; margin: 0 auto;">

        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
            <div>
                <h1 style="font-size: 1.8rem; font-weight: 700; color: #1F2937; margin: 0 0 0.5rem 0;">
                    Préavis de départ
                </h1>
                <p style="color: #6B7280; font-size: 0.9rem; margin: 0; max-width: 600px;">
                    Gérez les préavis de départ pour les locataires de vos biens délégués.<br>
                    Envoyez les préavis aux locataires et suivez leur statut.
                </p>
            </div>

            <a href="{{ route('co-owner.notices.create') }}"
               class="btn-create"
               style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #70AE48; color: white; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.9rem; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); transition: all 0.2s;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Créer un préavis</span>
            </a>
        </div>

        <!-- Statistiques -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #E5E7EB;">
                <div style="color: #9CA3AF; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                    TOTAL PRÉAVIS
                </div>
                <div style="font-size: 2rem; font-weight: 700; color: #1F2937;">
                    {{ $totalNotices }}
                </div>
            </div>

            <div style="background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #E5E7EB;">
                <div style="color: #9CA3AF; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                    EN ATTENTE
                </div>
                <div style="font-size: 2rem; font-weight: 700; color: #F59E0B;">
                    {{ $pendingNotices }}
                </div>
            </div>

            <div style="background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #E5E7EB;">
                <div style="color: #9CA3AF; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                    CONFIRMÉS
                </div>
                <div style="font-size: 2rem; font-weight: 700; color: #10B981;">
                    {{ $confirmedNotices }}
                </div>
            </div>

            <div style="background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #E5E7EB;">
                <div style="color: #9CA3AF; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                    BAUX ACTIFS
                </div>
                <div style="font-size: 2rem; font-weight: 700; color: #3B82F6;">
                    {{ $activeLeases }}
                </div>
            </div>
        </div>

        <!-- Formulaire de filtres -->
        <form method="GET" action="{{ route('co-owner.notices.index') }}" id="filter-form">
            <!-- Filtres statut -->
            <div style="display: flex; gap: 0.75rem; margin-bottom: 2rem;">
                <button type="submit" name="status" value="all"
                        class="filter-btn {{ $statusFilter === 'all' ? 'active' : '' }}"
                        style="padding: 10px 24px; border: none; border-radius: 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; background: {{ $statusFilter === 'all' ? '#70AE48' : '#E5E7EB' }}; color: {{ $statusFilter === 'all' ? 'white' : '#6B7280' }};">
                    Tous
                </button>
                <button type="submit" name="status" value="pending"
                        class="filter-btn {{ $statusFilter === 'pending' ? 'active' : '' }}"
                        style="padding: 10px 24px; border: none; border-radius: 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; background: {{ $statusFilter === 'pending' ? '#70AE48' : '#E5E7EB' }}; color: {{ $statusFilter === 'pending' ? 'white' : '#6B7280' }};">
                    En attente
                </button>
                <button type="submit" name="status" value="confirmed"
                        class="filter-btn {{ $statusFilter === 'confirmed' ? 'active' : '' }}"
                        style="padding: 10px 24px; border: none; border-radius: 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; background: {{ $statusFilter === 'confirmed' ? '#70AE48' : '#E5E7EB' }}; color: {{ $statusFilter === 'confirmed' ? 'white' : '#6B7280' }};">
                    Confirmés
                </button>
                <button type="submit" name="status" value="cancelled"
                        class="filter-btn {{ $statusFilter === 'cancelled' ? 'active' : '' }}"
                        style="padding: 10px 24px; border: none; border-radius: 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; background: {{ $statusFilter === 'cancelled' ? '#70AE48' : '#E5E7EB' }}; color: {{ $statusFilter === 'cancelled' ? 'white' : '#6B7280' }};">
                    Annulés
                </button>
            </div>

            <!-- Zone de recherche et filtre -->
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid #E5E7EB;">
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                            FILTRER PAR BIEN
                        </label>
                        <select name="property_id" onchange="document.getElementById('filter-form').submit()"
                                style="width: 100%; padding: 10px 16px; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 0.9rem; color: #1F2937; background: white; cursor: pointer;">
                            <option value="">Tous les biens</option>
                            @foreach($properties as $property)
                                <option value="{{ $property->id }}" {{ $propertyFilter == $property->id ? 'selected' : '' }}>
                                    {{ $property->address ?? 'Bien sans nom' }} - {{ $property->city ?? '' }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div style="flex: 1;">
                        <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                            FILTRER PAR TYPE
                        </label>
                        <select name="type" onchange="document.getElementById('filter-form').submit()"
                                style="width: 100%; padding: 10px 16px; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 0.9rem; color: #1F2937; background: white; cursor: pointer;">
                            <option value="">Tous les types</option>
                            <option value="landlord" {{ $typeFilter == 'landlord' ? 'selected' : '' }}>Bailleur</option>
                            <option value="tenant" {{ $typeFilter == 'tenant' ? 'selected' : '' }}>Locataire</option>
                        </select>
                    </div>

                    <div style="flex: 1;">
                        <label style="display: block; font-size: 0.75rem; font-weight: 600; color: transparent; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                            _
                        </label>
                        <div style="position: relative;">
                            <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9CA3AF;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <input type="text" name="search" value="{{ $searchTerm }}" placeholder="Rechercher locataire, adresse..."
                                   style="width: 100%; padding: 10px 16px 10px 42px; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 0.9rem; color: #1F2937;">
                        </div>
                    </div>

                    <div style="flex: 0 0 auto;">
                        <label style="display: block; font-size: 0.75rem; font-weight: 600; color: transparent; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                            _
                        </label>
                        <button type="submit" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #70AE48; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;">
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
            <div style="background: #DBEAFE; border: 1px solid #3B82F6; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 2rem; display: flex; align-items: start; gap: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                    <strong style="color: #1E40AF; font-weight: 600; display: block; margin-bottom: 4px;">Succès !</strong>
                    <p style="color: #1D4ED8; margin: 0; font-size: 0.9rem;">{{ session('success') }}</p>
                </div>
            </div>
        @endif

        @if(session('error'))
            <div style="background: #FEE2E2; border: 1px solid #EF4444; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 2rem; display: flex; align-items: start; gap: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                    <strong style="color: #991B1B; font-weight: 600; display: block; margin-bottom: 4px;">Erreur !</strong>
                    <p style="color: #DC2626; margin: 0; font-size: 0.9rem;">{{ session('error') }}</p>
                </div>
            </div>
        @endif

        <!-- Grille des préavis -->
        @if($notices->isEmpty())
            <div style="text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; border: 2px dashed #E5E7EB;">
                <svg style="width: 64px; height: 64px; color: #D1D5DB; margin: 0 auto 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 style="font-size: 1.2rem; font-weight: 700; color: #6B7280; margin: 0 0 0.5rem 0;">
                    Aucun préavis trouvé
                </h3>
                <p style="color: #9CA3AF; margin: 0 0 1.5rem 0;">
                    @if($searchTerm || $propertyFilter || $statusFilter !== 'all' || $typeFilter)
                        Aucun préavis ne correspond à vos critères de recherche.
                    @else
                        Commencez par créer votre premier préavis.
                    @endif
                </p>
                @if(!$searchTerm && !$propertyFilter && $statusFilter === 'all' && !$typeFilter)
                    <a href="{{ route('co-owner.notices.create') }}"
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #3B82F6; color: white; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Créer un préavis
                    </a>
                @else
                    <a href="{{ route('co-owner.notices.index') }}"
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #6B7280; color: white; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">
                        Réinitialiser les filtres
                    </a>
                @endif
            </div>
        @else
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
                @foreach($notices as $notice)
                    <div style="background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #E5E7EB; transition: all 0.2s; cursor: pointer;"
                         onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
                         onmouseout="this.style.boxShadow='none'">

                        <!-- Header de la carte -->
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 1rem;">
                            @if($notice->status == 'pending')
                                <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #FEF3C7; border-radius: 20px;">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    <span style="color: #D97706; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">En attente</span>
                                </div>
                            @elseif($notice->status == 'confirmed')
                                <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #D1FAE5; border-radius: 20px;">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span style="color: #047857; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Confirmé</span>
                                </div>
                            @else
                                <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #FEE2E2; border-radius: 20px;">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                    </svg>
                                    <span style="color: #DC2626; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Annulé</span>
                                </div>
                            @endif

                            @if($notice->type == 'landlord')
                                <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #DBEAFE; border-radius: 20px;">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <span style="color: #1D4ED8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Bailleur</span>
                                </div>
                            @else
                                <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #F3E8FF; border-radius: 20px;">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    <span style="color: #7C3AED; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Locataire</span>
                                </div>
                            @endif
                        </div>

                        <!-- Titre et locataire -->
                        <h3 style="font-size: 1.1rem; font-weight: 700; color: #1F2937; margin: 0 0 0.5rem 0;">
                            Préavis N°{{ str_pad($notice->id, 6, '0', STR_PAD_LEFT) }}
                        </h3>
                        <div style="display: flex; align-items: center; gap: 6px; color: #6B7280; font-size: 0.85rem; margin-bottom: 1.5rem;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>{{ $notice->tenant->first_name ?? '' }} {{ $notice->tenant->last_name ?? '' }}</span>
                        </div>

                        <!-- Détails du préavis -->
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #F3F4F6;">
                            <div>
                                <div style="color: #9CA3AF; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">
                                    BIEN
                                </div>
                                <div style="font-weight: 700; color: #1F2937; margin-bottom: 0.25rem;">
                                    {{ $notice->property->address ?? 'Non spécifié' }}
                                </div>
                                <div style="color: #9CA3AF; font-size: 0.8rem;">
                                    {{ $notice->property->city ?? '' }}
                                </div>
                            </div>

                            <div>
                                <div style="color: #9CA3AF; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">
                                    DATE PRÉAVIS
                                </div>
                                <div style="font-weight: 700; color: #1F2937; margin-bottom: 0.25rem;">
                                    {{ \Carbon\Carbon::parse($notice->notice_date)->format('d M Y') }}
                                </div>
                            </div>

                            <div>
                                <div style="color: #9CA3AF; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">
                                    DATE FIN
                                </div>
                                <div style="font-weight: 700; color: #1F2937; margin-bottom: 0.25rem;">
                                    {{ \Carbon\Carbon::parse($notice->end_date)->format('d M Y') }}
                                </div>
                            </div>

                            <div>
                                <div style="color: #9CA3AF; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">
                                    DURÉE RESTANTE
                                </div>
                                <div style="font-weight: 700; color: #1F2937;">
                                    {{ \Carbon\Carbon::parse($notice->end_date)->diffInDays(now()) }} jours
                                </div>
                            </div>
                        </div>

                        <!-- Motif -->
                        <div style="margin-bottom: 1.5rem;">
                            <div style="color: #9CA3AF; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                                MOTIF
                            </div>
                            <div style="font-weight: 500; color: #1F2937; font-size: 0.9rem; line-height: 1.5; background: #F9FAFB; padding: 0.75rem; border-radius: 8px; border: 1px solid #E5E7EB;">
                                {{ Str::limit($notice->reason, 120) }}
                            </div>
                        </div>

                        <!-- Actions -->
                        <div style="display: flex; gap: 0.5rem;">
                            <a href="{{ route('co-owner.notices.show', $notice) }}"
                               style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; background: white; color: #6B7280; border: 1px solid #E5E7EB; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.85rem; transition: all 0.2s;"
                               onmouseover="this.style.background='#F9FAFB'"
                               onmouseout="this.style.background='white'">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                Voir
                            </a>

                            <a href="{{ route('co-owner.notices.edit', $notice) }}"
                               style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; background: white; color: #3B82F6; border: 1px solid #BFDBFE; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.85rem; transition: all 0.2s;"
                               onmouseover="this.style.background='#EFF6FF'"
                               onmouseout="this.style.background='white'">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Modifier
                            </a>

                            <form action="{{ route('co-owner.notices.destroy', $notice) }}" method="POST" onsubmit="return confirm('Êtes-vous sûr de vouloir supprimer ce préavis ?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit"
                                        style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; background: white; color: #EF4444; border: 1px solid #FCA5A5; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;"
                                        onmouseover="this.style.background='#FEF2F2'"
                                        onmouseout="this.style.background='white'">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                </button>
                            </form>
                        </div>

                        <!-- Date de création -->
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #F3F4F6; color: #9CA3AF; font-size: 0.8rem; text-align: center;">
                            Créé le {{ \Carbon\Carbon::parse($notice->created_at)->format('d M Y') }}
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Pagination -->
            @if($notices->hasPages())
                <div style="margin-top: 2rem; display: flex; justify-content: center;">
                    {{ $notices->appends(request()->query())->links() }}
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
