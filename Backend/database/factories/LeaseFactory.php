<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class LeaseFactory extends Factory
{
    protected $model = \App\Models\Lease::class;

    public function definition(): array
    {
        return [
            'property_id' => null, // Will be set when creating
            'tenant_id' => null, // Will be set when creating
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->optional()->date(),
            'rent_amount' => $this->faker->numberBetween(500, 3000),
            'deposit' => $this->faker->numberBetween(1000, 6000),
            'type' => $this->faker->randomElement(['fixed', 'unlimited', 'seasonal']),
            'status' => $this->faker->randomElement(['active', 'pending', 'terminated']),
            'terms' => []
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    public function fixed(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'fixed',
        ]);
    }
}