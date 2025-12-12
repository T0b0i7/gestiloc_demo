<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyFactory extends Factory
{
    protected $model = \App\Models\Property::class;

    public function definition(): array
    {
        return [
            'landlord_id' => null, // Will be set when creating
            'type' => $this->faker->randomElement(['apartment', 'house', 'studio', 'loft']),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->paragraph(),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'surface' => $this->faker->numberBetween(20, 200),
            'rent_amount_default' => $this->faker->numberBetween(500, 3000),
            'reference' => $this->faker->optional()->bothify('PROP-####'),
            'status' => $this->faker->randomElement(['available', 'rented', 'maintenance']),
            'meta' => []
        ];
    }

    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'available',
        ]);
    }

    public function rented(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rented',
        ]);
    }
}
