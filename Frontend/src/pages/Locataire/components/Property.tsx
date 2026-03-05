import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Building2,
  MapPin,
  Ruler,
  DoorOpen,
  Bath,
  Layers,
  User,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  Download,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Map,
} from 'lucide-react';

import { Card } from './ui/Card';
import { Button } from './ui/Button';
import tenantApi, { Property as PropertyType, TenantLease } from '../services/tenantApi';
import { formatCurrency, formatDate } from '@/lib/utils';

// =============== helpers ===============
const isFilled = (v: unknown) =>
  v !== null && v !== undefined && v !== false && !(typeof v === 'string' && v.trim() === '');

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

// =============== UI blocks ===============
const SectionTitle: React.FC<{ icon: React.ElementType; title: string; subtitle?: string }> = ({
  icon: Icon,
  title,
  subtitle,
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 p-2 rounded-xl bg-gray-100 text-gray-700">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {subtitle ? <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p> : null}
    </div>
  </div>
);

const InfoRow: React.FC<{ label: string; value?: React.ReactNode; hideIfEmpty?: boolean }> = ({
  label,
  value,
  hideIfEmpty = false,
}) => {
  if (hideIfEmpty && !isFilled(value)) return null;
  return (
    <div className="flex items-start justify-between gap-6 py-2 border-b border-gray-100 last:border-b-0">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="text-sm font-medium text-gray-900 text-right">{value ?? '—'}</div>
    </div>
  );
};

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
    {children}
  </span>
);

// =============== component ===============
interface PropertyProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const Property: React.FC<PropertyProps> = ({ notify }) => {
  const [property, setProperty] = useState<PropertyType | null>(null);
  const [lease, setLease] = useState<TenantLease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const notifyRef = useRef(notify);
  const isFetching = useRef(false);
  const didFetch = useRef(false);

  useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);

  const fetchProperty = useCallback(async () => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);
      setError(null);

      const leases = await tenantApi.getLeases();
      const first = Array.isArray(leases) ? leases[0] : null;

      if (first?.property) {
        setLease(first);
        setProperty(first.property);
      } else {
        setLease(null);
        setProperty(null);
        const msg = 'Aucun bien trouvé pour votre compte.';
        setError(msg);
        notifyRef.current(msg, 'info');
      }
    } catch (e) {
      console.error(e);
      const msg = 'Impossible de charger les informations du bien.';
      setError(msg);
      notifyRef.current('Erreur lors du chargement du bien', 'error');
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchProperty();
  }, [fetchProperty]);

  const postal = useMemo(() => {
    return (property?.postal_code as string | undefined) ?? (property?.zip_code as string | undefined) ?? '';
  }, [property]);

  const leaseInfo = useMemo(() => {
    if (!lease) return null;
    return {
      startDate: formatDate(lease.start_date),
      endDate: lease.end_date ? formatDate(lease.end_date) : null,
      rent: formatCurrency(lease.rent_amount),
      charges: formatCurrency(lease.charges_amount || 0),
      deposit: lease.deposit !== null && lease.deposit !== undefined ? formatCurrency(lease.deposit) : null,
      status: lease.status,
    };
  }, [lease]);

  const owner = useMemo(() => {
    const l = property?.landlord;
    if (!l) return null;
    return {
      full_name: l.full_name,
      email: l.email,
      phone: l.phone,
    };
  }, [property]);

  const photos = useMemo(() => {
    if (!property?.photos || !Array.isArray(property.photos)) return [];
    const base = import.meta.env.VITE_API_BASE_URL || 'http://https://wheat-skunk-120710.hostingersite.com';

    return property.photos
      .filter(Boolean)
      .map((p: string) => {
        const abs = /^https?:\/\//i.test(p);
        const cleaned = p.replace(/^\/?storage\//, '');
        return {
          url: abs ? p : `${base}/storage/${cleaned}`,
        };
      });
  }, [property]);

  useEffect(() => {
    // reset index si photos changent
    setCurrentPhotoIndex(0);
  }, [photos.length]);

  const handleDownloadContract = async () => {
    if (!lease) return;

    try {
      const pdfBlob = await tenantApi.downloadLeaseContract(lease.uuid);
      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `bail-${new Date().toISOString().split('T')[0]}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      notifyRef.current('Contrat téléchargé avec succès', 'success');
    } catch (err) {
      console.error(err);
      notifyRef.current('Erreur lors du téléchargement du contrat', 'error');
    }
  };

  const nextPhoto = () => {
    if (!photos.length) return;
    setCurrentPhotoIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  };

  const prevPhoto = () => {
    if (!photos.length) return;
    setCurrentPhotoIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  };

  // =============== states ===============
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-600">Chargement des informations…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-3 text-lg font-semibold text-gray-900">Erreur</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button onClick={fetchProperty} disabled={isFetching.current}>
            {isFetching.current ? 'Chargement…' : 'Réessayer'}
          </Button>
        </div>
      </div>
    );
  }

  if (!property) return null;

  // =============== render ===============
  return (
    <div className="space-y-6">
      {/* Header page */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900">Mon logement</h2>
          </div>
          <p className="mt-1 text-gray-600">
            <span className="font-medium text-gray-900">{property.address}</span>
            {isFilled(postal) || isFilled(property.city) ? (
              <>
                {' '}
                — {postal} {property.city}
              </>
            ) : null}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {leaseInfo?.status ? <Pill>Bail : {leaseInfo.status}</Pill> : null}
            {isFilled(property.surface) ? <Pill>{property.surface} m²</Pill> : null}
            {isFilled(property.room_count) ? <Pill>{property.room_count} pièce(s)</Pill> : null}
          </div>
        </div>

        <div className="flex gap-2">
          {lease && (
            <Button onClick={handleDownloadContract}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger le contrat
            </Button>
          )}
        </div>
      </div>

      {/* Grid main: image + quick infos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Image */}
        <Card className="p-4 lg:col-span-7">
          <SectionTitle
            icon={ImageIcon}
            title="Photos du logement"
            subtitle={photos.length ? `${photos.length} photo(s)` : 'Aucune photo disponible'}
          />

          <div className="mt-4">
            {photos.length ? (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={photos[currentPhotoIndex]?.url}
                    alt={`Photo ${currentPhotoIndex + 1}`}
                    className="w-full h-[320px] sm:h-[420px] object-cover"
                  />

                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevPhoto}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow"
                        aria-label="Photo précédente"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={nextPhoto}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow"
                        aria-label="Photo suivante"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                        {photos.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentPhotoIndex(idx)}
                            className={cx(
                              'h-2.5 w-2.5 rounded-full',
                              idx === currentPhotoIndex ? 'bg-white' : 'bg-white/60'
                            )}
                            aria-label={`Aller à la photo ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {photos.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {photos.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentPhotoIndex(idx)}
                        className={cx(
                          'relative overflow-hidden rounded-lg border',
                          idx === currentPhotoIndex ? 'border-blue-500' : 'border-gray-200'
                        )}
                        aria-label={`Miniature ${idx + 1}`}
                      >
                        <img src={p.url} alt={`Miniature ${idx + 1}`} className="h-16 w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 text-center py-10">
                <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Aucune photo n’a été ajoutée pour ce bien.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick infos right */}
        <Card className="p-4 lg:col-span-5">
          <SectionTitle icon={Building2} title="Infos du logement" subtitle="Les informations principales" />
          <div className="mt-4">
            <InfoRow label="Adresse" value={property.address} />
            <InfoRow label="Ville" value={property.city} />
            <InfoRow label="Code postal" value={postal} hideIfEmpty />
            <InfoRow label="Surface" value={isFilled(property.surface) ? `${property.surface} m²` : '—'} />
            <InfoRow
              label="Pièces"
              value={isFilled(property.room_count) ? `${property.room_count}` : '—'}
            />
            <InfoRow
              label="Salles de bain"
              value={property.bathroom_count ?? '—'}
            />
          </div>

          <div className="mt-6">
            <SectionTitle icon={MapPin} title="Localisation" subtitle="Adresse complète" />
            <div className="mt-4">
              <p className="text-sm text-gray-700">
                {property.address}
                <br />
                {postal} {property.city}
              </p>
              <div className="mt-4">
                <Button type="button" variant="secondary" size="sm">
                  <Map className="h-4 w-4 mr-2" />
                  Voir sur la carte
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Lease */}
      <Card className="p-6">
        <SectionTitle icon={Layers} title="Bail & paiement" subtitle="Informations de votre contrat de location" />

        {!leaseInfo ? (
          <p className="mt-4 text-sm text-gray-500">Aucun bail actif trouvé.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Période</p>
              <p className="mt-1 text-gray-900 font-semibold">
                {leaseInfo.startDate} {leaseInfo.endDate ? `→ ${leaseInfo.endDate}` : '→ (sans fin)'}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Montant mensuel</p>
              <p className="mt-1 text-gray-900 font-semibold">{leaseInfo.rent}</p>
              <p className="mt-1 text-xs text-gray-500">Charges : {leaseInfo.charges}</p>
            </div>

            {leaseInfo.deposit && (
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Dépôt de garantie</p>
                <p className="mt-1 text-gray-900 font-semibold">{leaseInfo.deposit}</p>
              </div>
            )}

            <div className="rounded-xl bg-gray-50 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Contrat</p>
                <p className="mt-1 text-gray-900 font-semibold">Télécharger le PDF</p>
              </div>
              <Button type="button" onClick={handleDownloadContract}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Owner */}
      <Card className="p-6">
        <SectionTitle icon={User} title="Propriétaire" subtitle="Contact du propriétaire du logement" />

        {!owner ? (
          <p className="mt-4 text-sm text-gray-500">Aucune information propriétaire disponible.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* left */}
            <div className="rounded-xl bg-gray-50 p-4 space-y-3">
              {isFilled(owner.full_name) ? (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Nom</p>
                    <p className="font-semibold text-gray-900">{owner.full_name}</p>
                  </div>
                </div>
              ) : null}

              {isFilled(owner.email) ? (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a className="font-semibold text-blue-600 hover:underline" href={`mailto:${owner.email}`}>
                      {owner.email}
                    </a>
                  </div>
                </div>
              ) : null}

              {isFilled(owner.phone) ? (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <a className="font-semibold text-blue-600 hover:underline" href={`tel:${owner.phone}`}>
                      {owner.phone}
                    </a>
                  </div>
                </div>
              ) : null}

              {!([owner.full_name, owner.email, owner.phone].some(isFilled)) && (
                <p className="text-sm text-gray-500">Aucune information renseignée pour le propriétaire.</p>
              )}
            </div>

            {/* right - small helpful text */}
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-700">
                Besoin d’un contact rapide ? Utilise l’email ou le téléphone ci-dessus.
                <br />
                <span className="text-gray-500 text-xs">
                  (Les informations non renseignées ne sont pas affichées.)
                </span>
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Property;
