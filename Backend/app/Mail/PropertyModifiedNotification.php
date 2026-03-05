<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Property;
use App\Models\CoOwner;

class PropertyModifiedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $property;
    public $coOwner;
    public $originalData;
    public $modifiedData;
    public $changes;

    public function __construct(Property $property, CoOwner $coOwner, array $originalData, array $modifiedData)
    {
        $this->property = $property;
        $this->coOwner = $coOwner;
        $this->originalData = $originalData;
        $this->modifiedData = $modifiedData;

        // Identifier les changements
        $this->changes = $this->identifyChanges($originalData, $modifiedData);
    }

    public function build()
    {
        return $this->subject('Modification de bien délégué - ' . $this->property->name)
                    ->view('emails.property-modified')
                    ->with([
                        'property' => $this->property,
                        'coOwner' => $this->coOwner,
                        'changes' => $this->changes,
                    ]);
    }

    private function identifyChanges(array $original, array $modified)
    {
        $changes = [];

        foreach ($modified as $key => $value) {
            if (!array_key_exists($key, $original) || $original[$key] != $value) {
                $changes[$key] = [
                    'old' => $original[$key] ?? 'Non défini',
                    'new' => $value
                ];
            }
        }

        return $changes;
    }
}
