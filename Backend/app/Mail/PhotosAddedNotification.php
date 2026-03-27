<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Property;
use App\Models\CoOwner;

class PhotosAddedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $property;
    public $coOwner;
    public $photoCount;

    public function __construct(Property $property, CoOwner $coOwner, int $photoCount)
    {
        $this->property = $property;
        $this->coOwner = $coOwner;
        $this->photoCount = $photoCount;
    }

    public function build()
    {
        return $this->subject('Nouvelles photos ajoutées - ' . $this->property->name)
                    ->view('emails.photos-added');
    }
}
