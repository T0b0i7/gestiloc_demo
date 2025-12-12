<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class LandlordFactory extends Factory
{
    protected $model = \App\Models\Landlord::class;

    public function definition(): array
    {
        return [
            'user_id' => null, // Will be set when creating
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'company_name' => $this->faker->optional()->company(),
            'address_billing' => $this->faker->address(),
            'vat_number' => $this->faker->optional()->numerify('FR##########'),
            'meta' => []
        ];
    }
}