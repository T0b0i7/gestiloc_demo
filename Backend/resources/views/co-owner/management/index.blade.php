@extends('layouts.co-owner')

@section('title', 'Gestion des copropriétaires')

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
        --green: #10b981;
        --green-light: #d1fae5;
        --amber: #f59e0b;
        --amber-light: #fef3c7;
        --red: #ef4444;
        --red-light: #fee2e2;
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
        background-color: #f8fafc;
    }

    .coowners-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 1.5rem;
    }

    .header-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
    }

    .header-title h1 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--gray-900);
        margin-bottom: 0.25rem;
    }

    .header-title p {
        color: var(--gray-500);
        font-size: 0.95rem;
    }

    .header-actions {
        display: flex;
        gap: 0.75rem;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.625rem 1.25rem;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
    }

    .btn-primary {
        background: var(--primary);
        color: white;
        box-shadow: var(--shadow-sm);
    }

    .btn-primary:hover {
        background: var(--primary-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
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

    .btn-danger {
        background: white;
        border-color: var(--red-light);
        color: var(--red);
    }

    .btn-danger:hover {
        background: var(--red-light);
        border-color: var(--red);
        color: var(--red);
    }

    .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.813rem;
    }

    /* Messages flash */
    .alert {
        padding: 1rem 1.25rem;
        border-radius: 1rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        border: 1px solid;
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

    /* Filtres */
    .filters-card {
        background: white;
        border-radius: 1.25rem;
        padding: 1.5rem;
        margin-bottom: 2rem;
        border: 1px solid var(--gray-200);
        box-shadow: var(--shadow-sm);
    }

    .filters-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    @media (min-width: 640px) {
        .filters-form {
            flex-direction: row;
        }
    }

    .search-wrapper {
        flex: 1;
        position: relative;
    }

    .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--gray-400);
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.75rem;
        border: 1px solid var(--gray-300);
        border-radius: 0.75rem;
        font-size: 0.95rem;
        background: white;
    }

    .search-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px var(--primary-soft);
    }

    .filters-group {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .filter-select {
        padding: 0.75rem 2rem 0.75rem 1rem;
        border: 1px solid var(--gray-300);
        border-radius: 0.75rem;
        font-size: 0.95rem;
        background: white;
        cursor: pointer;
        min-width: 160px;
    }

    .filter-select:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px var(--primary-soft);
    }

    .filter-btn {
        padding: 0.75rem 1.5rem;
        background: var(--gray-100);
        border: 1px solid var(--gray-300);
        border-radius: 0.75rem;
        color: var(--gray-700);
        font-weight: 500;
        cursor: pointer;
    }

    .filter-btn:hover {
        background: var(--gray-200);
    }

    /* Statistiques */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
    }

    @media (min-width: 768px) {
        .stats-grid {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    .stat-card {
        background: white;
        border-radius: 1.25rem;
        padding: 1.5rem;
        border: 1px solid var(--gray-200);
        box-shadow: var(--shadow-sm);
    }

    .stat-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .stat-info p {
        color: var(--gray-500);
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
    }

    .stat-info h3 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--gray-900);
    }

    .stat-icon {
        width: 3rem;
        height: 3rem;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .stat-icon.blue {
        background: #e6f0ff;
        color: #3b82f6;
    }

    .stat-icon.purple {
        background: #f3e8ff;
        color: var(--purple);
    }

    .stat-icon.green {
        background: #e0f2e9;
        color: var(--green);
    }

    /* Cartes gestionnaires */
    .coowner-card {
        background: white;
        border-radius: 1.5rem;
        border: 1px solid var(--gray-200);
        overflow: hidden;
        margin-bottom: 1rem;
        box-shadow: var(--shadow-sm);
        transition: all 0.3s;
    }

    .coowner-card:hover {
        box-shadow: var(--shadow-lg);
        border-color: var(--primary-border);
    }

    .card-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--gray-200);
    }

    .card-header.agency {
        background: linear-gradient(135deg, #faf5ff, #f3e8ff);
    }

    .card-header.coowner {
        background: linear-gradient(135deg, #f0f9eb, #e6f3da);
    }

    .card-header-content {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .avatar {
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1.1rem;
        color: white;
        box-shadow: var(--shadow-md);
    }

    .avatar.agency {
        background: linear-gradient(135deg, var(--purple), #a78bfa);
    }

    .avatar.coowner {
        background: linear-gradient(135deg, var(--primary), #8bc34a);
    }

    .user-details h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--gray-900);
        margin-bottom: 0.25rem;
    }

    .user-meta {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        border-radius: 2rem;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid;
    }

    .badge-agency {
        background: #f3e8ff;
        color: var(--purple);
        border-color: #d8b4fe;
    }

    .badge-coowner {
        background: var(--primary-light);
        color: var(--primary-dark);
        border-color: var(--primary-border);
    }

    .badge-active {
        background: var(--green-light);
        color: #166534;
        border-color: #86efac;
    }

    .badge-inactive {
        background: var(--gray-100);
        color: var(--gray-600);
        border-color: var(--gray-300);
    }

    .badge-suspended {
        background: var(--red-light);
        color: #991b1b;
        border-color: #fecaca;
    }

    .badge-pending {
        background: var(--amber-light);
        color: #92400e;
        border-color: #fcd34d;
    }

    .status-section {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
    }

    .date-text {
        font-size: 0.75rem;
        color: var(--gray-500);
    }

    /* Informations rapides */
    .quick-info {
        padding: 1rem 1.5rem;
        background: var(--gray-50);
        border-bottom: 1px solid var(--gray-200);
    }

    .quick-info-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    @media (min-width: 640px) {
        .quick-info-wrapper {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
        }
    }

    .info-tags {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1.5rem;
    }

    .info-tag {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--gray-600);
        font-size: 0.875rem;
    }

    .action-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 1rem;
        background: white;
        border: 1px solid var(--gray-300);
        border-radius: 0.75rem;
        font-size: 0.875rem;
        color: var(--gray-700);
        cursor: pointer;
    }

    .toggle-btn:hover {
        background: var(--gray-50);
        border-color: var(--primary);
        color: var(--primary);
    }

    .chevron {
        transition: transform 0.3s;
    }

    .chevron.rotated {
        transform: rotate(180deg);
    }

    .view-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 1.25rem;
        background: var(--primary);
        color: white;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        border: none;
        cursor: pointer;
    }

    .view-btn:hover {
        background: var(--primary-dark);
        transform: translateY(-1px);
    }

    /* Détails développés */
    .details-section {
        padding: 2rem;
        border-top: 1px solid var(--gray-200);
    }

    .details-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    @media (min-width: 1024px) {
        .details-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    .detail-card {
        background: white;
        border: 1px solid var(--gray-200);
        border-radius: 1.25rem;
        padding: 1.5rem;
        box-shadow: var(--shadow-sm);
    }

    .detail-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--gray-900);
        padding-bottom: 1rem;
        margin-bottom: 1.25rem;
        border-bottom: 1px solid var(--gray-200);
    }

    .detail-title svg {
        color: var(--primary);
    }

    .info-row {
        margin-bottom: 1rem;
    }

    .info-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--gray-500);
        text-transform: uppercase;
        letter-spacing: 0.02em;
        margin-bottom: 0.25rem;
    }

    .info-value {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--gray-900);
        font-weight: 500;
    }

    .delegations-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
    }

    .delegations-title {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .title-icon {
        padding: 0.75rem;
        background: linear-gradient(135deg, var(--primary), #8bc34a);
        border-radius: 1rem;
        color: white;
        box-shadow: var(--shadow-md);
    }

    .delegations-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    @media (min-width: 1024px) {
        .delegations-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    .delegation-card {
        position: relative;
        background: white;
        border-radius: 1.5rem;
        padding: 1.5rem;
        border: 2px solid rgba(112, 174, 72, 0.15);
        box-shadow: 0 10px 25px -5px rgba(112, 174, 72, 0.1);
        transition: all 0.3s;
    }

    .delegation-card:hover {
        border-color: var(--primary);
        box-shadow: 0 20px 30px -10px rgba(112, 174, 72, 0.2);
        transform: translateY(-2px);
    }

    .delegation-header {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    @media (min-width: 640px) {
        .delegation-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
    }

    .property-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .property-icon {
        padding: 0.75rem;
        background: linear-gradient(135deg, var(--primary), #8bc34a);
        border-radius: 1rem;
        color: white;
        box-shadow: var(--shadow-sm);
    }

    .property-name {
        font-weight: 700;
        font-size: 1.25rem;
        color: var(--gray-900);
        margin-bottom: 0.25rem;
    }

    .property-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .expiry-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #fef3c7, #fffbeb);
        border-radius: 1rem;
        border: 1px solid #fcd34d;
    }

    .property-details {
        background: linear-gradient(135deg, #f8fafc, #f0f9eb);
        border-radius: 1rem;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        border: 1px solid rgba(112, 174, 72, 0.15);
    }

    .property-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    @media (min-width: 768px) {
        .property-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    .property-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .item-icon {
        padding: 0.5rem;
        background: white;
        border-radius: 0.75rem;
        border: 1px solid rgba(112, 174, 72, 0.2);
    }

    .item-content p {
        font-size: 0.813rem;
        font-weight: 600;
        color: var(--gray-600);
        margin-bottom: 0.125rem;
    }

    .item-content span {
        font-weight: 600;
        color: var(--gray-900);
    }

    .notes-section {
        margin-bottom: 1.5rem;
    }

    .notes-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
    }

    .notes-box {
        background: linear-gradient(135deg, #fffbeb, #fef3c7);
        border-radius: 1rem;
        padding: 1.25rem;
        border: 1px solid #fcd34d;
    }

    .permissions-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
        margin-top: 1rem;
    }

    @media (min-width: 768px) {
        .permissions-grid {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    .permission-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 1rem;
        background: linear-gradient(135deg, white, var(--primary-light));
        border-radius: 1rem;
        border: 1px solid rgba(112, 174, 72, 0.2);
        transition: all 0.3s;
    }

    .permission-item:hover {
        border-color: var(--primary);
        transform: scale(1.05);
        box-shadow: var(--shadow-md);
    }

    .permission-icon {
        padding: 0.5rem;
        background: linear-gradient(135deg, var(--primary), #8bc34a);
        border-radius: 0.75rem;
        color: white;
        margin-bottom: 0.5rem;
    }

    .invitations-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-top: 1rem;
    }

    @media (min-width: 768px) {
        .invitations-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    .invitation-card {
        background: linear-gradient(135deg, #fef3c7, #fffbeb);
        border-radius: 1.25rem;
        padding: 1.5rem;
        border: 1px solid #fcd34d;
    }

    .invitation-header {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
    }

    .invitation-icon {
        padding: 0.75rem;
        background: #fcd34d;
        border-radius: 1rem;
        color: #92400e;
    }

    .pagination {
        display: flex;
        justify-content: center;
        gap: 0.25rem;
        margin-top: 2rem;
    }

    .pagination-item {
        padding: 0.5rem 1rem;
        border: 1px solid var(--gray-300);
        border-radius: 0.75rem;
        color: var(--gray-700);
        text-decoration: none;
    }

    .pagination-item:hover {
        background: var(--gray-100);
        border-color: var(--primary);
    }

    .pagination-item.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
    }

    .hidden {
        display: none;
    }

    .text-primary {
        color: var(--primary);
    }

    .bg-primary-soft {
        background: var(--primary-soft);
    }

    .border-primary {
        border-color: var(--primary);
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    /* Toast Container */
    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .toast {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 400px;
        padding: 16px 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        border-left: 4px solid;
    }

    .toast.show {
        transform: translateX(0);
    }

    .toast-success {
        border-left-color: var(--primary);
    }

    .toast-error {
        border-left-color: var(--red);
    }

    .toast-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .toast-success .toast-icon {
        background: var(--primary-light);
        color: var(--primary);
    }

    .toast-error .toast-icon {
        background: var(--red-light);
        color: var(--red);
    }

    .toast-content {
        flex: 1;
    }

    .toast-title {
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--gray-900);
        margin-bottom: 4px;
    }

    .toast-message {
        font-size: 0.85rem;
        color: var(--gray-600);
        line-height: 1.4;
    }

    .toast-close {
        cursor: pointer;
        color: var(--gray-400);
        transition: color 0.2s;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
    }

    .toast-close:hover {
        color: var(--gray-600);
    }

    /* Modal de confirmation */
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
        border-radius: 24px;
        width: 90%;
        max-width: 400px;
        padding: 24px;
        transform: scale(0.9);
        transition: transform 0.3s ease;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .modal-overlay.active .modal-container {
        transform: scale(1);
    }

    .modal-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        margin: 0 auto 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-icon.warning {
        background: var(--amber-light);
        color: var(--amber);
    }

    .modal-icon.info {
        background: var(--primary-light);
        color: var(--primary);
    }

    .modal-icon svg {
        width: 32px;
        height: 32px;
    }

    .modal-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--gray-900);
        text-align: center;
        margin-bottom: 8px;
    }

    .modal-message {
        color: var(--gray-600);
        text-align: center;
        margin-bottom: 24px;
        line-height: 1.6;
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
    }

    .modal-btn {
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        min-width: 120px;
    }

    .modal-btn-primary {
        background: var(--primary);
        color: white;
    }

    .modal-btn-primary:hover {
        background: var(--primary-dark);
        transform: translateY(-2px);
        box-shadow: 0 10px 20px -5px rgba(112, 174, 72, 0.4);
    }

    .modal-btn-secondary {
        background: var(--gray-100);
        color: var(--gray-700);
    }

    .modal-btn-secondary:hover {
        background: var(--gray-200);
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
</style>

<!-- Toast Container -->
<div class="toast-container" id="toastContainer"></div>

<!-- Modal de confirmation -->
<div class="modal-overlay" id="confirmModal">
    <div class="modal-container">
        <div class="modal-icon warning" id="modalIcon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        </div>
        <h3 class="modal-title" id="modalTitle">Confirmation</h3>
        <p class="modal-message" id="modalMessage">Voulez-vous effectuer cette action ?</p>
        <div class="modal-actions">
            <button class="modal-btn modal-btn-secondary" onclick="closeConfirmModal()">Annuler</button>
            <button class="modal-btn modal-btn-primary" id="modalConfirmBtn">Confirmer</button>
        </div>
    </div>
</div>

<div class="coowners-container">
    <!-- En-tête -->
    <div class="header-section">
        <div class="header-title">
            <h1>Co-propriétaires & Agences</h1>
            <p>Gérez vos gestionnaires et leurs délégations</p>
        </div>
        <div class="header-actions">
            <button onclick="window.location.href='/coproprietaire/gestionnaires/creer'" class="btn btn-primary btn-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Inviter un gestionnaire
            </button>
            <button onclick="location.reload()" class="btn btn-outline btn-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Actualiser
            </button>
        </div>
    </div>

    <!-- Messages Flash -->
    @if(session('success'))
        <div class="alert alert-success">
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
        <div class="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ session('error') }}</span>
        </div>
    @endif

    <!-- Filtres -->
    <div class="filters-card">
        <form method="GET" action="{{ route('co-owner.management.index') }}" class="filters-form">
            <div class="search-wrapper">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text"
                       name="search"
                       value="{{ $search ?? '' }}"
                       placeholder="Rechercher par nom, email, téléphone..."
                       class="search-input">
            </div>
            <div class="filters-group">
                <select name="type" class="filter-select">
                    <option value="all" {{ ($type ?? 'all') == 'all' ? 'selected' : '' }}>Tous les types</option>
                    <option value="co_owner" {{ ($type ?? 'all') == 'co_owner' ? 'selected' : '' }}>Co-propriétaires</option>
                    <option value="agency" {{ ($type ?? 'all') == 'agency' ? 'selected' : '' }}>Agences</option>
                </select>
                <select name="status" class="filter-select">
                    <option value="all" {{ ($status ?? 'all') == 'all' ? 'selected' : '' }}>Tous les statuts</option>
                    <option value="active" {{ ($status ?? 'all') == 'active' ? 'selected' : '' }}>Actifs</option>
                    <option value="inactive" {{ ($status ?? 'all') == 'inactive' ? 'selected' : '' }}>Inactifs</option>
                    <option value="suspended" {{ ($status ?? 'all') == 'suspended' ? 'selected' : '' }}>Suspendus</option>
                </select>
                <button type="submit" class="filter-btn">Filtrer</button>
            </div>
        </form>
    </div>

    <!-- Statistiques -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-content">
                <div class="stat-info">
                    <p>Total</p>
                    <h3>{{ $stats['total'] ?? 0 }}</h3>
                </div>
                <div class="stat-icon blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                </div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-content">
                <div class="stat-info">
                    <p>Co-propriétaires</p>
                    <h3 class="text-primary">{{ $stats['co_owners'] ?? 0 }}</h3>
                </div>
                <div class="stat-icon blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                </div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-content">
                <div class="stat-info">
                    <p>Agences</p>
                    <h3 style="color: var(--purple)">{{ $stats['agencies'] ?? 0 }}</h3>
                </div>
                <div class="stat-icon purple">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                </div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-content">
                <div class="stat-info">
                    <p>Délégations</p>
                    <h3 style="color: var(--green)">{{ $stats['delegations_total'] ?? 0 }}</h3>
                </div>
                <div class="stat-icon green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Liste des gestionnaires -->
    @if(($coOwners ?? collect())->count() > 0 || ($invitations ?? collect())->count() > 0)
        <div class="space-y-4">
            <!-- Co-propriétaires existants -->
            @foreach($coOwners ?? [] as $coOwner)
                <div class="coowner-card" id="coowner-{{ $coOwner->id }}">
                    <!-- En-tête -->
                    <div class="card-header {{ ($coOwner->co_owner_type ?? 'simple') == 'agency' ? 'agency' : 'coowner' }}">
                        <div class="card-header-content">
                            <div class="user-info">
                                <div class="avatar {{ ($coOwner->co_owner_type ?? 'simple') == 'agency' ? 'agency' : 'coowner' }}">
                                    @if(($coOwner->co_owner_type ?? 'simple') == 'agency')
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                        </svg>
                                    @else
                                        {{ substr($coOwner->first_name ?? '', 0, 1) }}{{ substr($coOwner->last_name ?? '', 0, 1) }}
                                    @endif
                                </div>
                                <div class="user-details">
                                    <h3>
                                        @if(($coOwner->co_owner_type ?? 'simple') == 'agency')
                                            {{ $coOwner->company_name ?: ($coOwner->first_name ?? '') . ' ' . ($coOwner->last_name ?? '') }}
                                        @else
                                            {{ $coOwner->first_name ?? '' }} {{ $coOwner->last_name ?? '' }}
                                        @endif
                                    </h3>
                                    <div class="user-meta">
                                        <span class="badge {{ ($coOwner->co_owner_type ?? 'simple') == 'agency' ? 'badge-agency' : 'badge-coowner' }}">
                                            @if(($coOwner->co_owner_type ?? 'simple') == 'agency')
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                </svg>
                                                Agence
                                            @else
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                </svg>
                                                Co-propriétaire
                                            @endif
                                        </span>
                                        <span class="text-gray-600">{{ $coOwner->user->email ?? $coOwner->email ?? '' }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="status-section">
                                <span class="badge {{
                                    ($coOwner->status ?? 'inactive') == 'active' ? 'badge-active' :
                                    (($coOwner->status ?? 'inactive') == 'inactive' ? 'badge-inactive' : 'badge-suspended')
                                }}">
                                    @if(($coOwner->status ?? 'inactive') == 'active')
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M20 6L9 17l-5-5"></path>
                                        </svg>
                                        Actif
                                    @elseif(($coOwner->status ?? 'inactive') == 'inactive')
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        Inactif
                                    @else
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                        </svg>
                                        Suspendu
                                    @endif
                                </span>
                                @if($coOwner->created_at)
                                    <span class="date-text">
                                        Rejoint le {{ \Carbon\Carbon::parse($coOwner->created_at)->locale('fr')->isoFormat('D MMM YYYY') }}
                                    </span>
                                @endif
                            </div>
                        </div>
                    </div>

                    <!-- Informations rapides -->
                    <div class="quick-info">
                        <div class="quick-info-wrapper">
                            <div class="info-tags">
                                @if($coOwner->phone)
                                    <span class="info-tag">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8 10a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0122 16.92z"></path>
                                        </svg>
                                        {{ $coOwner->phone }}
                                    </span>
                                @endif
                                <span class="info-tag">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                                    </svg>
                                    {{ $coOwner->delegations->count() ?? 0 }} délégation(s)
                                </span>
                                @if($coOwner->address_billing)
                                    <span class="info-tag">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                        {{ $coOwner->address_billing }}
                                    </span>
                                @endif
                            </div>
                            <div class="action-buttons">
                                <button onclick="toggleDetails({{ $coOwner->id }})"
                                        class="toggle-btn">
                                    <span>Détails</span>
                                    <svg class="chevron chevron-{{ $coOwner->id }}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>
                                <button onclick="window.location.href='/coproprietaire/gestionnaires/{{ $coOwner->id }}'" class="view-btn">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="3"></circle>
                                        <path d="M22 12c-2.667 4.667-6 7-10 7s-7.333-2.333-10-7c2.667-4.667 6-7 10-7s7.333 2.333 10 7z"></path>
                                    </svg>
                                    Voir
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Détails développés -->
                    <div id="details-{{ $coOwner->id }}" class="details-section hidden">
                        <!-- Grille d'informations -->
                        <div class="details-grid">
                            <!-- Informations générales -->
                            <div class="detail-card">
                                <div class="detail-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    Informations {{ ($coOwner->co_owner_type ?? 'simple') == 'agency' ? 'de l\'agence' : 'personnelles' }}
                                </div>
                                <div class="space-y-4">
                                    <div class="info-row">
                                        <div class="info-label">Nom complet</div>
                                        <div class="info-value">{{ $coOwner->first_name ?? '' }} {{ $coOwner->last_name ?? '' }}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">Email</div>
                                        <div class="info-value">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                <polyline points="22,6 12,13 2,6"></polyline>
                                            </svg>
                                            {{ $coOwner->user->email ?? $coOwner->email ?? '' }}
                                        </div>
                                    </div>
                                    @if($coOwner->phone)
                                    <div class="info-row">
                                        <div class="info-label">Téléphone</div>
                                        <div class="info-value">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8 10a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0122 16.92z"></path>
                                            </svg>
                                            {{ $coOwner->phone }}
                                        </div>
                                    </div>
                                    @endif
                                    @if($coOwner->company_name)
                                    <div class="info-row">
                                        <div class="info-label">Entreprise</div>
                                        <div class="info-value">{{ $coOwner->company_name }}</div>
                                    </div>
                                    @endif
                                    @if($coOwner->address_billing)
                                    <div class="info-row">
                                        <div class="info-label">Adresse</div>
                                        <div class="info-value">{{ $coOwner->address_billing }}</div>
                                    </div>
                                    @endif
                                </div>
                            </div>

                            <!-- Statistiques des délégations -->
                            <div class="detail-card">
                                <div class="detail-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                                    </svg>
                                    Délégations ({{ $coOwner->delegations->count() ?? 0 }})
                                </div>
                                <div class="space-y-3">
                                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                        <div class="flex items-center gap-3">
                                            <div class="p-2 bg-white rounded-lg">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2">
                                                    <path d="M20 6L9 17l-5-5"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <p class="font-semibold text-gray-900">{{ $coOwner->delegations->where('status', 'active')->count() ?? 0 }}</p>
                                                <p class="text-sm text-gray-600">Actives</p>
                                            </div>
                                        </div>
                                    </div>
                                    @if(($coOwner->delegations->where('status', 'expired')->count() ?? 0) > 0)
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div class="flex items-center gap-3">
                                            <div class="p-2 bg-white rounded-lg">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gray-500)" stroke-width="2">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <polyline points="12 6 12 12 16 14"></polyline>
                                                </svg>
                                            </div>
                                            <div>
                                                <p class="font-semibold text-gray-900">{{ $coOwner->delegations->where('status', 'expired')->count() ?? 0 }}</p>
                                                <p class="text-sm text-gray-600">Expirées</p>
                                            </div>
                                        </div>
                                    </div>
                                    @endif
                                    @if(($coOwner->delegations->where('status', 'revoked')->count() ?? 0) > 0)
                                    <div class="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                        <div class="flex items-center gap-3">
                                            <div class="p-2 bg-white rounded-lg">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                                </svg>
                                            </div>
                                            <div>
                                                <p class="font-semibold text-gray-900">{{ $coOwner->delegations->where('status', 'revoked')->count() ?? 0 }}</p>
                                                <p class="text-sm text-gray-600">Révoquées</p>
                                            </div>
                                        </div>
                                    </div>
                                    @endif
                                </div>
                            </div>

                            <!-- Informations professionnelles pour agences -->
                            @if(($coOwner->co_owner_type ?? 'simple') == 'agency' && ($coOwner->ifu || $coOwner->rccm || $coOwner->vat_number))
                            <div class="detail-card">
                                <div class="detail-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="2">
                                        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                    Documents professionnels
                                </div>
                                <div class="space-y-4">
                                    @if($coOwner->ifu)
                                    <div class="info-row">
                                        <div class="info-label">IFU</div>
                                        <div class="info-value">{{ $coOwner->ifu }}</div>
                                    </div>
                                    @endif
                                    @if($coOwner->rccm)
                                    <div class="info-row">
                                        <div class="info-label">RCCM</div>
                                        <div class="info-value">{{ $coOwner->rccm }}</div>
                                    </div>
                                    @endif
                                    @if($coOwner->vat_number)
                                    <div class="info-row">
                                        <div class="info-label">Numéro TVA</div>
                                        <div class="info-value">{{ $coOwner->vat_number }}</div>
                                    </div>
                                    @endif
                                </div>
                            </div>
                            @endif
                        </div>

                        <!-- Délégations existantes -->
                        @if(($coOwner->delegations->count() ?? 0) > 0)
                        <div>
                            <div class="delegations-header">
                                <div class="delegations-title">
                                    <div class="title-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                                        </svg>
                                    </div>
                                    <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">Biens délégués</h3>
                                </div>
                            </div>

                            <div class="delegations-grid">
                                @foreach($coOwner->delegations as $delegation)
                                    <div class="delegation-card">
                                        <!-- En-tête -->
                                        <div class="delegation-header">
                                            <div class="property-info">
                                                <div class="property-icon">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10z"></path>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 class="property-name">{{ $delegation->property->name ?? 'Bien sans nom' }}</h4>
                                                    <div class="property-badges">
                                                        <span class="badge {{ $delegation->status == 'active' ? 'badge-active' : ($delegation->status == 'revoked' ? 'badge-suspended' : 'badge-inactive') }}">
                                                            @if($delegation->status == 'active')
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                    <path d="M20 6L9 17l-5-5"></path>
                                                                </svg>
                                                                Active
                                                            @elseif($delegation->status == 'revoked')
                                                                Révoquée
                                                            @else
                                                                Expirée
                                                            @endif
                                                        </span>
                                                        @if($delegation->property->surface)
                                                            <span class="badge badge-coowner">
                                                                {{ $delegation->property->surface }} m²
                                                            </span>
                                                        @endif
                                                    </div>
                                                </div>
                                            </div>
                                            @if($delegation->expires_at)
                                                <div class="expiry-badge">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                                    </svg>
                                                    <div>
                                                        <div style="font-size: 0.7rem; color: #92400e;">Expire le</div>
                                                        <div style="font-weight: 700; color: #92400e;">{{ \Carbon\Carbon::parse($delegation->expires_at)->locale('fr')->isoFormat('D MMM YYYY') }}</div>
                                                    </div>
                                                </div>
                                            @endif
                                        </div>

                                        <!-- Informations du bien -->
                                        <div class="property-details">
                                            <div class="property-grid">
                                                <div class="property-item">
                                                    <div class="item-icon">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                                                            <circle cx="12" cy="10" r="3"></circle>
                                                        </svg>
                                                    </div>
                                                    <div class="item-content">
                                                        <p>Adresse</p>
                                                        <span>{{ $delegation->property->address ?? '' }}, {{ $delegation->property->city ?? '' }}</span>
                                                    </div>
                                                </div>
                                                @if($delegation->property->surface)
                                                <div class="property-item">
                                                    <div class="item-icon">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                                                            <rect x="2" y="2" width="20" height="20" rx="2.18"></rect>
                                                            <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"></path>
                                                        </svg>
                                                    </div>
                                                    <div class="item-content">
                                                        <p>Surface</p>
                                                        <span>{{ $delegation->property->surface }} m²</span>
                                                    </div>
                                                </div>
                                                @endif
                                                <div class="property-item">
                                                    <div class="item-icon">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                                        </svg>
                                                    </div>
                                                    <div class="item-content">
                                                        <p>Déléguée le</p>
                                                        <span>{{ \Carbon\Carbon::parse($delegation->delegated_at)->locale('fr')->isoFormat('D MMM YYYY') }}</span>
                                                    </div>
                                                </div>
                                                @if($delegation->property->rent_amount)
                                                <div class="property-item">
                                                    <div class="item-icon">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2">
                                                            <line x1="12" y1="1" x2="12" y2="23"></line>
                                                            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
                                                        </svg>
                                                    </div>
                                                    <div class="item-content">
                                                        <p>Loyer mensuel</p>
                                                        <span>{{ number_format($delegation->property->rent_amount, 0, ',', ' ') }} FCFA</span>
                                                    </div>
                                                </div>
                                                @endif
                                            </div>
                                        </div>

                                        <!-- Notes -->
                                        @if($delegation->notes)
                                        <div class="notes-section">
                                            <div class="notes-header">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400e" stroke-width="2">
                                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                                                    <polyline points="14 2 14 8 20 8"></polyline>
                                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                                    <polyline points="10 9 9 9 8 9"></polyline>
                                                </svg>
                                                <span style="font-weight: 600;">Notes</span>
                                            </div>
                                            <div class="notes-box">
                                                {{ $delegation->notes }}
                                            </div>
                                        </div>
                                        @endif

                                        <!-- Permissions -->
                                        @if($delegation->permissions)
                                        <div>
                                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                    <path d="M7 11V7a5 5 0 0110 0v4"></path>
                                                </svg>
                                                <span style="font-weight: 600;">Permissions</span>
                                            </div>
                                            <div class="permissions-grid">
                                                @foreach($delegation->permissions as $permission)
                                                    <div class="permission-item">
                                                        <div class="permission-icon">
                                                            @switch($permission)
                                                                @case('view')
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                                                        <circle cx="12" cy="12" r="3"></circle>
                                                                        <path d="M22 12c-2.667 4.667-6 7-10 7s-7.333-2.333-10-7c2.667-4.667 6-7 10-7s7.333 2.333 10 7z"></path>
                                                                    </svg>
                                                                    @break
                                                                @case('edit')
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                                                        <path d="M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h5.34"></path>
                                                                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                                                                    </svg>
                                                                    @break
                                                                @default
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                                        <path d="M7 11V7a5 5 0 0110 0v4"></path>
                                                                    </svg>
                                                            @endswitch
                                                        </div>
                                                        <span style="font-size: 0.75rem; font-weight: 600;">
                                                            @switch($permission)
                                                                @case('view') Voir @break
                                                                @case('edit') Modifier @break
                                                                @case('manage_lease') Gérer les baux @break
                                                                @case('collect_rent') Collecter les loyers @break
                                                                @case('manage_maintenance') Gérer la maintenance @break
                                                                @case('send_invoices') Envoyer les factures @break
                                                                @case('manage_tenants') Gérer les locataires @break
                                                                @case('view_documents') Voir les documents @break
                                                                @default {{ $permission }}
                                                            @endswitch
                                                        </span>
                                                    </div>
                                                @endforeach
                                            </div>
                                        </div>
                                        @endif
                                    </div>
                                @endforeach
                            </div>
                        </div>
                        @endif
                    </div>
                </div>
            @endforeach

            <!-- Invitations en attente -->
            @if(($invitations ?? collect())->count() > 0)
                <div style="margin-top: 2rem;">
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1rem;">Invitations en attente</h3>
                    <div class="invitations-grid">
                        @foreach($invitations ?? [] as $invitation)
                            @php
                                $meta = json_decode($invitation->meta ?? '{}', true);
                                $invitationType = $meta['invitation_type'] ?? 'co_owner';
                            @endphp
                            <div class="invitation-card">
                                <div class="invitation-header">
                                    <div class="invitation-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem;">
                                            <div>
                                                <p style="font-weight: 700; color: var(--gray-900);">{{ $meta['first_name'] ?? '' }} {{ $meta['last_name'] ?? '' }}</p>
                                                <p style="color: var(--gray-600);">{{ $invitation->email ?? '' }}</p>
                                            </div>
                                            <span class="badge badge-pending">
                                                En attente
                                            </span>
                                        </div>

                                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                                            <span style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.875rem; color: var(--gray-600);">
                                                @if($invitationType == 'agency')
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                    </svg>
                                                    Agence
                                                @else
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                    </svg>
                                                    Co-propriétaire
                                                @endif
                                            </span>
                                            <span style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.875rem; color: var(--gray-600);">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                                Expire le {{ isset($invitation->expires_at) ? \Carbon\Carbon::parse($invitation->expires_at)->locale('fr')->isoFormat('D MMM YYYY') : '' }}
                                            </span>
                                        </div>

                                        <div style="display: flex; gap: 0.5rem;">
                                            <button onclick="showResendConfirm({{ $invitation->id ?? 'null' }})" class="btn btn-outline btn-sm" style="flex: 1;">
                                                Renvoyer
                                            </button>
                                            <button onclick="showCancelConfirm({{ $invitation->id ?? 'null' }})" class="btn btn-outline btn-sm" style="border-color: #fecaca; color: var(--red);">
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif
        </div>

        <!-- Pagination -->
        @if(isset($coOwners) && method_exists($coOwners, 'links'))
        <div class="pagination">
            {{ $coOwners->appends(['search' => $search ?? '', 'type' => $type ?? 'all', 'status' => $status ?? 'all'])->links() }}
        </div>
        @endif
    @else
        <div style="background: white; border-radius: 1.5rem; padding: 3rem; text-align: center; border: 1px solid var(--gray-200);">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" stroke-width="1.5" style="margin: 0 auto 1.5rem;">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: 0.5rem;">
                {{ ($search ?? '') || ($type ?? 'all') !== 'all' || ($status ?? 'all') !== 'all' ? 'Aucun gestionnaire trouvé' : 'Aucun gestionnaire' }}
            </h3>
            <p style="color: var(--gray-600); margin-bottom: 1.5rem;">
                {{ ($search ?? '') || ($type ?? 'all') !== 'all' || ($status ?? 'all') !== 'all' ? 'Essayez d\'ajuster vos filtres de recherche' : 'Commencez par inviter votre premier gestionnaire' }}
            </p>
            <button onclick="window.location.href='/coproprietaire/gestionnaires/creer'" class="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Inviter un gestionnaire
            </button>
        </div>
    @endif
</div>

<!-- CSRF Token -->
<meta name="csrf-token" content="{{ csrf_token() }}">

<!-- Scripts -->
<script>
// Variables pour la confirmation
let pendingAction = null;
let pendingId = null;

// Fonction pour afficher les toasts
function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success'
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

    const title = type === 'success' ? 'Succès' : 'Erreur';

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close" onclick="this.parentElement.remove()">✕</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

// Fonction pour afficher la modale de confirmation
function showConfirmModal(title, message, type = 'warning', onConfirm) {
    const modal = document.getElementById('confirmModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');
    const confirmBtn = document.getElementById('modalConfirmBtn');

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Changer l'icône selon le type
    modalIcon.className = `modal-icon ${type}`;
    if (type === 'warning') {
        modalIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else if (type === 'danger') {
        modalIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    } else {
        modalIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>';
    }

    // Changer le style du bouton selon le type
    confirmBtn.className = `modal-btn ${type === 'danger' ? 'modal-btn-danger' : 'modal-btn-primary'}`;

    // Stocker la fonction de confirmation
    pendingAction = onConfirm;

    // Afficher la modale
    modal.classList.add('active');
}

// Fonction pour fermer la modale
function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('active');
    pendingAction = null;
    pendingId = null;
}

// Fonction pour confirmer l'action
function confirmAction() {
    if (pendingAction) {
        pendingAction();
    }
    closeConfirmModal();
}

// Assigner la fonction au bouton de confirmation
document.getElementById('modalConfirmBtn').addEventListener('click', confirmAction);

// Fonction pour afficher la confirmation de renvoi
function showResendConfirm(id) {
    if (!id) return;
    pendingId = id;
    showConfirmModal(
        'Renvoyer l\'invitation',
        'Voulez-vous vraiment renvoyer cette invitation ? Un nouvel email sera envoyé.',
        'info',
        () => {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            fetch(`/coproprietaire/gestionnaires/invitations/${id}/resend`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': token || '',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('success', 'Invitation renvoyée avec succès');
                    setTimeout(() => location.reload(), 2000);
                } else {
                    showToast('error', data.message || 'Erreur lors du renvoi');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                showToast('error', 'Erreur lors du renvoi de l\'invitation');
            });
        }
    );
}

// Fonction pour afficher la confirmation d'annulation
function showCancelConfirm(id) {
    if (!id) return;
    pendingId = id;
    showConfirmModal(
        'Annuler l\'invitation',
        'Voulez-vous vraiment annuler cette invitation ? Cette action est irréversible.',
        'danger',
        () => {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            fetch(`/coproprietaire/gestionnaires/invitations/${id}/cancel`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': token || '',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('success', 'Invitation annulée avec succès');
                    setTimeout(() => location.reload(), 2000);
                } else {
                    showToast('error', data.message || 'Erreur lors de l\'annulation');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                showToast('error', 'Erreur lors de l\'annulation de l\'invitation');
            });
        }
    );
}

function toggleDetails(id) {
    const details = document.getElementById(`details-${id}`);
    const chevron = document.querySelector(`.chevron-${id}`);

    if (details) {
        if (details.classList.contains('hidden')) {
            details.classList.remove('hidden');
            if (chevron) chevron.classList.add('rotated');
        } else {
            details.classList.add('hidden');
            if (chevron) chevron.classList.remove('rotated');
        }
    }
}

// Récupérer les paramètres d'URL pour l'API token si présent
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const apiToken = urlParams.get('api_token');
    if (apiToken) {
        localStorage.setItem('token', apiToken);
    }

    // Afficher les messages flash comme toasts
    @if(session('success'))
        showToast('success', '{{ session('success') }}');
    @endif

    @if(session('error'))
        showToast('error', '{{ session('error') }}');
    @endif

    // Fermer la modale si on clique en dehors
    document.getElementById('confirmModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeConfirmModal();
        }
    });

    // Fermer la modale avec la touche Echap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeConfirmModal();
        }
    });
});
</script>

<!-- Supprimer les alertes flash après affichage -->
@if(session('success') || session('error'))
    <script>
        setTimeout(() => {
            document.querySelectorAll('.alert').forEach(alert => {
                alert.style.transition = 'opacity 0.5s';
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500);
            });
        }, 5000);
    </script>
@endif
@endsection
