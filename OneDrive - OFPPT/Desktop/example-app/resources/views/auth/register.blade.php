@extends('layouts.app')

@section('title', 'Inscription')

@section('content')
    <h2>Créer un compte</h2>
    <form method="POST" action="{{ route('register') }}">
        @csrf

        <label>Nom</label>
        <input type="text" name="name" value="{{ old('name') }}" required>
        @error('name') <div class="error">{{ $message }}</div> @enderror

        <label>Email</label>
        <input type="email" name="email" value="{{ old('email') }}" required>
        @error('email') <div class="error">{{ $message }}</div> @enderror

        <label>Mot de passe</label>
        <input type="password" name="password" required>
        @error('password') <div class="error">{{ $message }}</div> @enderror

        <label>Confirmer le mot de passe</label>
        <input type="password" name="password_confirmation" required>

        <button type="submit">S'inscrire</button>
    </form>
    <p>Déjà un compte ? <a href="{{ route('login') }}">Se connecter</a></p>
@endsection