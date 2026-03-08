@extends('layouts.co-owner')

@section('title', 'Détails du gestionnaire')

@section('content')
<style>
    :root {
        --primary: #70AE48;
        --primary-dark: #5c8f3a;
        --primary-light: #f0f9e6;
        --primary-soft: rgba(112, 174, 72, 0.08);
        --primary-border: rgba(112, 174, 72, 0.2);
        --purple: #8b5cf6;
        --purple-light: #f5f3ff;
        --purple-soft: rgba(139, 92, 246, 0.08);
        --green: #10b981;
        --red: #ef4444;
        --red-light: #fee2e2;
        --amber: #f59e0b;
        --amber-light: #fef3c7;
        --gray-50: #f9fafb;
        --gray-100: #f3f4f6;
        --gray-200: #e5e7eb;
        --gray-300: #d1d5db;
        --gray-400: #9ca3af;
        --gray-500: #6b7280;
        --gray-600: #4b5563;
        --gray-700: #374151;
        --gray-800: #1f2937;
        --gray-900: #111827;
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    * {
        transition: all 0.2s ease;
    }

    body {
        background: linear-gradient(135deg, #f8fafc 0%, #f0f9eb 100%);
        min-height: 100vh;
    }

    .details-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
    }

    /* En-tête */
    .header-wrapper {
        margin-bottom: 3rem;
    }

    .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1.5rem;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .back-btn {
        width: 3rem;
        height: 3rem;
        background: white;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--gray-200);
        color: var(--gray-600);
        transition: all 0.2s;
    }

    .back-btn:hover {
        border-color: var(--primary);
        color: var(--primary);
        transform: translateX(-4px);
        box-shadow: var(--shadow-md);
    }

    .back-btn svg {
        width: 1.5rem;
        height: 1.5rem;
    }

    .header-icon {
        width: 4rem;
        height: 4rem;
        background: linear-gradient(135deg, var(--primary-light), #ffffff);
        border-radius: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--primary-border);
        box-shadow: var(--shadow-md);
    }

    .header-icon.coowner {
        background: linear-gradient(135deg, var(--primary-light), #ffffff);
        border-color: var(--primary-border);
        color: var(--primary);
    }

    .header-icon.agency {
        background: linear-gradient(135deg, var(--purple-light), #ffffff);
        border-color: #d8b4fe;
        color: var(--purple);
    }

    .header-icon svg {
        width: 2rem;
        height: 2rem;
    }

    .header-title h1 {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--gray-900);
        margin-bottom: 0.5rem;
        letter-spacing: -0.02em;
    }

    .header-badges {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 600;
        border: 2px solid;
    }

    .badge.coowner {
        background: var(--primary-light);
        border-color: var(--primary-border);
        color: var(--primary-dark);
    }

    .badge.agency {
        background: var(--purple-light);
        border-color: #d8b4fe;
        color: #6b21a8;
    }

    .badge.active {
        background: #f0fdf4;
        border-color: #86efac;
        color: #166534;
    }

    .badge.inactive {
        background: #f3f4f6;
        border-color: #d1d5db;
        color: #4b5563;
    }

    .badge.suspended {
        background: #fef2f2;
        border-color: #fecaca;
        color: #991b1b;
    }

    .badge svg {
        width: 1rem;
        height: 1rem;
    }

    .action-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 1rem;
        font-weight: 600;
        font-size: 0.938rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
    }

    .action-btn.revoke {
        background: #fee2e2;
        color: #991b1b;
        border-color: #fecaca;
    }

    .action-btn.revoke:hover {
        background: #fecaca;
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }

    .action-btn.reactivate {
        background: #dcfce7;
        color: #166534;
        border-color: #86efac;
    }

    .action-btn.reactivate:hover {
        background: #bbf7d0;
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }

    /* Messages Flash */
    .alert {
        padding: 1rem 1.25rem;
        border-radius: 1rem;
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        border: 1px solid;
        animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .alert-success {
        background: #f0f9eb;
        border-color: var(--primary-border);
        color: #2e6216;
    }

    .alert-error {
        background: #fef2f2;
        border-color: #fecaca;
        color: #991b1b;
    }

    /* MODALE DE CONFIRMATION */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }

    .modal-overlay.active {
        opacity: 1;
        visibility: visible;
    }

    .modal-container {
        background: white;
        border-radius: 2rem;
        width: 90%;
        max-width: 450px;
        padding: 2rem;
        transform: scale(0.9);
        transition: transform 0.3s ease;
        box-shadow: var(--shadow-xl);
        border: 2px solid var(--red-light);
        position: relative;
        overflow: hidden;
    }

    .modal-overlay.active .modal-container {
        transform: scale(1);
    }

    .modal-icon {
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        margin: 0 auto 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--red-light);
        color: var(--red);
        border: 3px solid var(--red);
    }

    .modal-icon svg {
        width: 2.5rem;
        height: 2.5rem;
    }

    .modal-title {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--gray-900);
        text-align: center;
        margin-bottom: 0.75rem;
    }

    .modal-message {
        color: var(--gray-600);
        text-align: center;
        margin-bottom: 1.5rem;
        line-height: 1.6;
        font-size: 1rem;
    }

    .modal-warning-box {
        background: var(--red-light);
        border-radius: 1rem;
        padding: 1rem;
        margin-bottom: 2rem;
        border: 1px solid var(--red);
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .modal-warning-box svg {
        color: var(--red);
        flex-shrink: 0;
    }

    .modal-warning-box p {
        color: #991b1b;
        font-weight: 600;
        font-size: 0.938rem;
    }

    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }

    .modal-btn {
        padding: 0.875rem 2rem;
        border-radius: 1rem;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
        min-width: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .modal-btn-danger {
        background: var(--red);
        color: white;
    }

    .modal-btn-danger:hover {
        background: #dc2626;
        transform: translateY(-2px);
        box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.4);
    }

    .modal-btn-secondary {
        background: var(--gray-100);
        color: var(--gray-700);
        border: 2px solid var(--gray-300);
    }

    .modal-btn-secondary:hover {
        background: var(--gray-200);
        border-color: var(--gray-400);
    }

    .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background: var(--gray-100);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        color: var(--gray-500);
    }

    .modal-close:hover {
        background: var(--gray-200);
        color: var(--gray-700);
    }

    /* Formulaire de délégation */
    .delegation-form-section {
        background: white;
        border-radius: 2rem;
        border: 2px solid var(--gray-200);
        overflow: hidden;
        box-shadow: var(--shadow-lg);
        margin-bottom: 2rem;
    }

    .form-header {
        padding: 1.5rem 2rem;
        background: linear-gradient(135deg, var(--primary-light), white);
        border-bottom: 2px solid var(--primary-border);
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .form-header svg {
        width: 1.75rem;
        height: 1.75rem;
        color: var(--primary);
    }

    .form-header h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--gray-900);
    }

    .form-body {
        padding: 2rem;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
        .form-grid {
            grid-template-columns: 1fr;
        }
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-group label {
        font-weight: 600;
        color: var(--gray-700);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .form-group label svg {
        width: 1.25rem;
        height: 1.25rem;
        color: var(--primary);
    }

    .form-control {
        padding: 0.75rem 1rem;
        border: 2px solid var(--gray-300);
        border-radius: 1rem;
        font-size: 1rem;
        transition: all 0.2s;
    }

    .form-control:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px var(--primary-soft);
    }

    .form-control[readonly] {
        background: var(--gray-100);
        cursor: not-allowed;
    }

    .permissions-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
        .permissions-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    .permission-checkbox {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: var(--gray-50);
        border: 2px solid var(--gray-200);
        border-radius: 1rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .permission-checkbox:hover {
        background: var(--primary-light);
        border-color: var(--primary-border);
    }

    .permission-checkbox input[type="checkbox"] {
        width: 1.25rem;
        height: 1.25rem;
        accent-color: var(--primary);
    }

    .permission-checkbox span {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--gray-700);
    }

    .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 2px solid var(--gray-200);
    }

    .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 1rem;
        font-weight: 600;
        font-size: 0.938rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
    }

    .btn-primary {
        background: var(--primary);
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background: var(--primary-dark);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }

    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-outline {
        background: white;
        border-color: var(--gray-300);
        color: var(--gray-700);
    }

    .btn-outline:hover {
        background: var(--gray-50);
        border-color: var(--primary);
        color: var(--primary);
    }

    /* Grille principale */
    .details-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    @media (max-width: 1024px) {
        .details-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        .details-grid {
            grid-template-columns: 1fr;
        }
    }

    /* Cartes d'information */
    .info-card {
        background: white;
        border-radius: 2rem;
        border: 2px solid var(--gray-200);
        overflow: hidden;
        box-shadow: var(--shadow-lg);
        transition: all 0.3s;
    }

    .info-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
    }

    .info-card.coowner {
        border-color: var(--primary-border);
    }

    .info-card.agency {
        border-color: #d8b4fe;
    }

    .info-header {
        padding: 1.5rem 2rem;
        background: linear-gradient(135deg, var(--gray-50), white);
        border-bottom: 2px solid var(--gray-200);
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .info-header.coowner {
        background: linear-gradient(135deg, var(--primary-light), white);
    }

    .info-header.agency {
        background: linear-gradient(135deg, var(--purple-light), white);
    }

    .info-header svg {
        width: 1.5rem;
        height: 1.5rem;
    }

    .info-header.coowner svg {
        color: var(--primary);
    }

    .info-header.agency svg {
        color: var(--purple);
    }

    .info-header h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--gray-900);
    }

    .info-body {
        padding: 2rem;
    }

    .info-row {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid var(--gray-200);
    }

    .info-row:last-child {
        border-bottom: none;
    }

    .info-label {
        min-width: 120px;
        font-size: 0.875rem;
        color: var(--gray-500);
        font-weight: 500;
    }

    .info-value {
        flex: 1;
        font-weight: 600;
        color: var(--gray-800);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .info-value svg {
        width: 1.25rem;
        height: 1.25rem;
        color: var(--gray-400);
    }

    /* Statistiques */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
    }

    .stat-item {
        background: var(--gray-50);
        border-radius: 1rem;
        padding: 1.25rem;
        text-align: center;
        border: 2px solid var(--gray-200);
        transition: all 0.2s;
    }

    .stat-item:hover {
        transform: scale(1.05);
        border-color: var(--primary);
    }

    .stat-label {
        font-size: 0.875rem;
        color: var(--gray-500);
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
    }

    .stat-value {
        font-size: 2rem;
        font-weight: 700;
    }

    .stat-value.active {
        color: var(--green);
    }

    .stat-value.expired {
        color: var(--gray-600);
    }

    .stat-value.revoked {
        color: var(--red);
    }

    .member-since {
        margin-top: 1.5rem;
        padding: 1rem;
        background: linear-gradient(135deg, var(--primary-light), white);
        border-radius: 1rem;
        text-align: center;
        border: 2px solid var(--primary-border);
    }

    .member-since p:first-child {
        font-size: 0.875rem;
        color: var(--gray-600);
        margin-bottom: 0.25rem;
    }

    .member-since p:last-child {
        font-weight: 700;
        color: var(--gray-800);
    }

    /* Section délégations */
    .delegations-section {
        background: white;
        border-radius: 2rem;
        border: 2px solid var(--gray-200);
        overflow: hidden;
        box-shadow: var(--shadow-lg);
        margin-bottom: 2rem;
    }

    .section-header {
        padding: 1.5rem 2rem;
        background: linear-gradient(135deg, var(--gray-50), white);
        border-bottom: 2px solid var(--gray-200);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .section-header h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--gray-900);
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .section-header h2 svg {
        width: 1.75rem;
        height: 1.75rem;
    }

    .section-header.coowner h2 svg {
        color: var(--primary);
    }

    .section-header.agency h2 svg {
        color: var(--purple);
    }

    .delegations-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        padding: 2rem;
    }

    @media (max-width: 768px) {
        .delegations-grid {
            grid-template-columns: 1fr;
        }
    }

    .delegation-card {
        border: 2px solid var(--gray-200);
        border-radius: 1.5rem;
        overflow: hidden;
        transition: all 0.3s;
    }

    .delegation-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
    }

    .delegation-card.coowner {
        border-color: var(--primary-border);
    }

    .delegation-card.agency {
        border-color: #d8b4fe;
    }

    .delegation-header {
        padding: 1.25rem;
        background: linear-gradient(135deg, var(--gray-50), white);
        border-bottom: 2px solid var(--gray-200);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .delegation-header h3 {
        font-weight: 700;
        color: var(--gray-800);
    }

    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.75rem;
        border-radius: 2rem;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .status-badge.active {
        background: #dcfce7;
        color: #166534;
    }

    .status-badge.expired {
        background: #f3f4f6;
        color: #4b5563;
    }

    .status-badge.revoked {
        background: #fee2e2;
        color: #991b1b;
    }

    .delegation-body {
        padding: 1.25rem;
    }

    .delegation-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .info-item .label {
        font-size: 0.75rem;
        color: var(--gray-500);
    }

    .info-item .value {
        font-weight: 600;
        color: var(--gray-800);
    }

    .delegation-notes {
        margin-top: 1rem;
        padding: 1rem;
        background: var(--gray-50);
        border-radius: 1rem;
        border: 1px solid var(--gray-200);
        font-size: 0.875rem;
        color: var(--gray-700);
    }

    /* État vide */
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: var(--gray-50);
        border-radius: 1.5rem;
        border: 2px dashed var(--gray-300);
    }

    .empty-state svg {
        width: 4rem;
        height: 4rem;
        color: var(--gray-400);
        margin: 0 auto 1.5rem;
    }

    .empty-state p:first-of-type {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 0.5rem;
    }

    .empty-state p:last-of-type {
        color: var(--gray-500);
    }

    /* Historique */
    .history-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--gray-200);
        transition: all 0.2s;
    }

    .history-item:hover {
        background: var(--gray-50);
    }

    .history-item:last-child {
        border-bottom: none;
    }

    .history-info p {
        font-weight: 600;
        color: var(--gray-800);
        margin-bottom: 0.25rem;
    }

    .history-info span {
        font-size: 0.875rem;
        color: var(--gray-500);
    }

    /* Responsive */
    @media (max-width: 640px) {
        .details-container {
            padding: 1rem;
        }

        .header-title h1 {
            font-size: 1.75rem;
        }

        .info-row {
            flex-direction: column;
            gap: 0.25rem;
        }

        .info-label {
            min-width: auto;
        }

        .delegations-grid {
            padding: 1rem;
        }

        .delegation-info {
            grid-template-columns: 1fr;
        }

        .modal-actions {
            flex-direction: column;
        }

        .modal-btn {
            width: 100%;
        }
    }
</style>

<!-- MODALE DE CONFIRMATION POUR RÉVOCATION -->
<div class="modal-overlay" id="revokeConfirmModal">
    <div class="modal-container">
        <button class="modal-close" onclick="closeRevokeModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>

        <div class="modal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </div>

        <h3 class="modal-title">Révoquer l'accès</h3>

        <div class="modal-message">
            Êtes-vous sûr de vouloir révoquer ce gestionnaire ?
        </div>

        <div class="modal-warning-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>Toutes ses délégations seront désactivées</p>
        </div>

        <div class="modal-actions">
            <button class="modal-btn modal-btn-secondary" onclick="closeRevokeModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Annuler
            </button>
            <button class="modal-btn modal-btn-danger" id="confirmRevokeBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                </svg>
                Confirmer la révocation
            </button>
        </div>
    </div>
</div>

<div class="details-container">
    <!-- En-tête -->
    <div class="header-wrapper">
        <div class="header-content">
            <div class="header-left">
                <a href="{{ route('co-owner.management.index') }}" class="back-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                </a>
                <div class="header-icon {{ $coOwner->co_owner_type == 'agency' ? 'agency' : 'coowner' }}">
                    @if($coOwner->co_owner_type == 'agency')
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    @else
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                    @endif
                </div>
                <div class="header-title">
                    <h1>
                        {{ $coOwner->co_owner_type == 'agency' ? $coOwner->company_name : $coOwner->first_name . ' ' . $coOwner->last_name }}
                    </h1>
                    <div class="header-badges">
                        <span class="badge {{ $coOwner->co_owner_type == 'agency' ? 'agency' : 'coowner' }}">
                            @if($coOwner->co_owner_type == 'agency')
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                                Agence immobilière
                            @else
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                Co-propriétaire
                            @endif
                        </span>
                        <span class="badge {{ $coOwner->status }}">
                            @if($coOwner->status == 'active')
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M5 13l4 4L19 7"></path>
                                </svg>
                                Actif
                            @elseif($coOwner->status == 'inactive')
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Inactif
                            @else
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                Suspendu
                            @endif
                        </span>
                    </div>
                </div>
            </div>
            <div>
                @if($coOwner->status == 'active')
                    <form method="POST" id="revokeForm" style="display: inline;">
                        @csrf
                        <button type="button" onclick="showRevokeModal()" class="action-btn revoke">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                            </svg>
                            Révoquer l'accès
                        </button>
                    </form>
                @else
                    <form action="{{ route('co-owner.management.reactivate', $coOwner->id) }}" method="POST" class="inline">
                        @csrf
                        <button type="submit" class="action-btn reactivate">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            Réactiver l'accès
                        </button>
                    </form>
                @endif
            </div>
        </div>
    </div>

    <!-- Messages Flash -->
    @if(session('success'))
        <div class="alert alert-success slide-down">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 12.5V12a8 8 0 10-8 8h.5"></path>
                <path d="M9 12l2 2 4-4"></path>
                <path d="M15 18h6"></path>
                <path d="M18 15v6"></path>
            </svg>
            <span>{{ session('success') }}</span>
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-error slide-down">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ session('error') }}</span>
        </div>
    @endif

    <!-- Formulaire de délégation (uniquement si le gestionnaire est actif) -->
    @if($coOwner->status == 'active' && $availableProperties->count() > 0)
    <div class="delegation-form-section">
        <div class="form-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 4v16m8-8H4"></path>
            </svg>
            <h2>Déléguer un nouveau bien</h2>
        </div>
        <div class="form-body">
            <form action="{{ route('co-owner.management.delegate', $coOwner->id) }}" method="POST">
                @csrf
                <div class="form-grid">
                    <div class="form-group">
                        <label for="property_id">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            Bien à déléguer *
                        </label>
                        <select name="property_id" id="property_id" class="form-control" required>
                            <option value="">Sélectionnez un bien</option>
                            @foreach($availableProperties as $property)
                                <option value="{{ $property->id }}">
                                    {{ $property->name }} - {{ $property->address }}, {{ $property->city }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="expires_at">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Date d'expiration (optionnelle)
                        </label>
                        <input type="date" name="expires_at" id="expires_at" class="form-control" min="{{ date('Y-m-d', strtotime('+1 day')) }}">
                    </div>
                </div>

                <div class="form-group">
                    <label>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0110 0v4"></path>
                        </svg>
                        Permissions à accorder
                    </label>
                    <div class="permissions-grid">
                        @php
                            $permissions = [
                                'view' => 'Voir le bien',
                                'edit' => 'Modifier le bien',
                                'manage_lease' => 'Gérer les baux',
                                'collect_rent' => 'Collecter les loyers',
                                'manage_maintenance' => 'Gérer la maintenance',
                                'send_invoices' => 'Envoyer les factures',
                                'manage_tenants' => 'Gérer les locataires',
                                'view_documents' => 'Voir les documents',
                                'manage_delegations' => 'Gérer les délégations'
                            ];
                        @endphp

                        @foreach($permissions as $key => $label)
                            <label class="permission-checkbox">
                                <input type="checkbox" name="permissions[]" value="{{ $key }}"
                                    {{ $coOwner->co_owner_type == 'agency' ? 'disabled checked' : '' }}
                                    {{ in_array($key, ['view', 'edit']) ? 'checked' : '' }}>
                                <span>{{ $label }}</span>
                            </label>
                        @endforeach
                    </div>
                    @if($coOwner->co_owner_type == 'agency')
                        <p class="text-sm text-gray-500 mt-2" style="color: var(--gray-500);">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="display: inline; margin-right: 0.25rem;">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 16v-4M12 8h.01"></path>
                            </svg>
                            Pour une agence, toutes les permissions sont automatiquement accordées.
                        </p>
                    @endif
                </div>

                <div class="form-group">
                    <label for="notes">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Notes (optionnelles)
                    </label>
                    <textarea name="notes" id="notes" rows="3" class="form-control" placeholder="Ajoutez des notes concernant cette délégation..."></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 4v16m8-8H4"></path>
                        </svg>
                        Déléguer ce bien
                    </button>
                    <button type="reset" class="btn btn-outline">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        Effacer
                    </button>
                </div>
            </form>
        </div>
    </div>
    @endif

    <!-- Grille d'informations -->
    <div class="details-grid">
        <!-- Informations générales -->
        <div class="info-card {{ $coOwner->co_owner_type == 'agency' ? 'agency' : 'coowner' }}">
            <div class="info-header {{ $coOwner->co_owner_type == 'agency' ? 'agency' : 'coowner' }}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <h2>Informations générales</h2>
            </div>
            <div class="info-body">
                <div class="info-row">
                    <span class="info-label">Nom complet</span>
                    <span class="info-value">{{ $coOwner->first_name }} {{ $coOwner->last_name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        {{ $coOwner->email }}
                    </span>
                </div>
                @if($coOwner->phone)
                <div class="info-row">
                    <span class="info-label">Téléphone</span>
                    <span class="info-value">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        {{ $coOwner->phone }}
                    </span>
                </div>
                @endif
                @if($coOwner->company_name)
                <div class="info-row">
                    <span class="info-label">Entreprise</span>
                    <span class="info-value">{{ $coOwner->company_name }}</span>
                </div>
                @endif
                @if($coOwner->address_billing)
                <div class="info-row">
                    <span class="info-label">Adresse</span>
                    <span class="info-value">{{ $coOwner->address_billing }}</span>
                </div>
                @endif
            </div>
        </div>

        <!-- Informations professionnelles (pour agences) -->
        @if($coOwner->co_owner_type == 'agency')
        <div class="info-card agency">
            <div class="info-header agency">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <h2>Informations professionnelles</h2>
            </div>
            <div class="info-body">
                @if($coOwner->license_number)
                <div class="info-row">
                    <span class="info-label">Licence</span>
                    <span class="info-value">{{ $coOwner->license_number }}</span>
                </div>
                @endif
                @if($coOwner->ifu)
                <div class="info-row">
                    <span class="info-label">IFU</span>
                    <span class="info-value">{{ $coOwner->ifu }}</span>
                </div>
                @endif
                @if($coOwner->rccm)
                <div class="info-row">
                    <span class="info-label">RCCM</span>
                    <span class="info-value">{{ $coOwner->rccm }}</span>
                </div>
                @endif
                @if($coOwner->vat_number)
                <div class="info-row">
                    <span class="info-label">N° TVA</span>
                    <span class="info-value">{{ $coOwner->vat_number }}</span>
                </div>
                @endif
            </div>
        </div>
        @endif

        <!-- Statistiques -->
        <div class="info-card">
            <div class="info-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <h2>Statistiques</h2>
            </div>
            <div class="info-body">
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M5 13l4 4L19 7"></path>
                            </svg>
                            Actives
                        </div>
                        <div class="stat-value active">{{ $coOwner->delegations->where('status', 'active')->count() }}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Expirées
                        </div>
                        <div class="stat-value expired">{{ $coOwner->delegations->where('status', 'expired')->count() }}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                            </svg>
                            Révoquées
                        </div>
                        <div class="stat-value revoked">{{ $coOwner->delegations->where('status', 'revoked')->count() }}</div>
                    </div>
                </div>
                <div class="member-since">
                    <p>Membre depuis</p>
                    <p>{{ \Carbon\Carbon::parse($coOwner->created_at)->locale('fr')->isoFormat('D MMMM YYYY') }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Délégations actives -->
    <div class="delegations-section">
        <div class="section-header {{ $coOwner->co_owner_type == 'agency' ? 'agency' : 'coowner' }}">
            <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
                Délégations actives
            </h2>
            <span class="badge {{ $coOwner->co_owner_type == 'agency' ? 'agency' : 'coowner' }}">
                {{ $coOwner->delegations->where('status', 'active')->count() }} délégation(s)
            </span>
        </div>

        @if($coOwner->delegations->where('status', 'active')->count() > 0)
            <div class="delegations-grid">
                @foreach($coOwner->delegations->where('status', 'active') as $delegation)
                    <div class="delegation-card {{ $coOwner->co_owner_type == 'agency' ? 'agency' : 'coowner' }}">
                        <div class="delegation-header">
                            <h3>{{ $delegation->property->name }}</h3>
                            <span class="status-badge active">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M5 13l4 4L19 7"></path>
                                </svg>
                                Active
                            </span>
                        </div>
                        <div class="delegation-body">
                            <div class="delegation-info">
                                <div class="info-item">
                                    <span class="label">Adresse</span>
                                    <span class="value">{{ $delegation->property->address }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Ville</span>
                                    <span class="value">{{ $delegation->property->city }}</span>
                                </div>
                                @if($delegation->property->rent_amount)
                                <div class="info-item">
                                    <span class="label">Loyer</span>
                                    <span class="value">{{ number_format($delegation->property->rent_amount, 0, ',', ' ') }} FCFA</span>
                                </div>
                                @endif
                                @if($delegation->property->surface)
                                <div class="info-item">
                                    <span class="label">Surface</span>
                                    <span class="value">{{ $delegation->property->surface }} m²</span>
                                </div>
                                @endif
                                <div class="info-item">
                                    <span class="label">Déléguée le</span>
                                    <span class="value">{{ \Carbon\Carbon::parse($delegation->created_at)->locale('fr')->isoFormat('D MMM YYYY') }}</span>
                                </div>
                                @if($delegation->expires_at)
                                <div class="info-item">
                                    <span class="label">Expire le</span>
                                    <span class="value">{{ \Carbon\Carbon::parse($delegation->expires_at)->locale('fr')->isoFormat('D MMM YYYY') }}</span>
                                </div>
                                @endif
                            </div>
                            @if($delegation->notes)
                            <div class="delegation-notes">
                                {{ $delegation->notes }}
                            </div>
                            @endif
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <p>Aucune délégation active</p>
                <p>Ce gestionnaire n'a pas encore de biens délégués</p>
            </div>
        @endif
    </div>

    <!-- Historique des délégations -->
    @if($delegationsHistory->count() > 0)
    <div class="delegations-section">
        <div class="section-header">
            <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Historique des délégations
            </h2>
        </div>
        <div>
            @foreach($delegationsHistory as $delegation)
                <div class="history-item">
                    <div class="history-info">
                        <p>{{ $delegation->property->name }}</p>
                        <span>Déléguée le {{ \Carbon\Carbon::parse($delegation->created_at)->locale('fr')->isoFormat('D MMM YYYY') }}</span>
                    </div>
                    <span class="status-badge {{ $delegation->status }}">
                        @if($delegation->status == 'active')
                            Active
                        @elseif($delegation->status == 'expired')
                            Expirée
                        @else
                            Révoquée
                        @endif
                    </span>
                </div>
            @endforeach
        </div>
    </div>
    @endif
</div>

<script>
// Variables pour la révocation
let revokeForm = null;
let revokeAction = "{{ route('co-owner.management.revoke', $coOwner->id) }}";

// Fonction pour afficher la modale de révocation
function showRevokeModal() {
    document.getElementById('revokeConfirmModal').classList.add('active');
}

// Fonction pour fermer la modale
function closeRevokeModal() {
    document.getElementById('revokeConfirmModal').classList.remove('active');
}

// Fonction pour confirmer la révocation
document.addEventListener('DOMContentLoaded', function() {
    // Créer le formulaire de révocation
    revokeForm = document.createElement('form');
    revokeForm.method = 'POST';
    revokeForm.action = revokeAction;
    revokeForm.style.display = 'none';

    // Ajouter le token CSRF
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_token';
    csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '{{ csrf_token() }}';
    revokeForm.appendChild(csrfInput);

    document.body.appendChild(revokeForm);

    // Ajouter l'événement au bouton de confirmation
    document.getElementById('confirmRevokeBtn').addEventListener('click', function() {
        revokeForm.submit();
    });

    // Fermer la modale si on clique en dehors
    document.getElementById('revokeConfirmModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeRevokeModal();
        }
    });

    // Fermer avec la touche Echap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeRevokeModal();
        }
    });

    // Récupérer les paramètres d'URL pour l'API token si présent
    const urlParams = new URLSearchParams(window.location.search);
    const apiToken = urlParams.get('api_token');
    if (apiToken) {
        localStorage.setItem('token', apiToken);
    }
});
</script>

<!-- CSRF Token (déjà présent dans le layout) -->
@endsection
