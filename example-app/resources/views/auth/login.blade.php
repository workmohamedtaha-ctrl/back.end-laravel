@extends('layouts.app')

@section('title', 'Connexion')

@section('content')
    <h2>Connexion</h2>
    <form method="POST" action="{{ route('login') }}">
        @csrf

        <label>Email</label>
        <input type="email" name="email" value="{{ old('email') }}" required>
        @error('email') <div class="error">{{ $message }}</div> @enderror

        <label>Mot de passe</label>
        <input type="password" name="password" required>

        <label><input type="checkbox" name="remember" style="width:auto"> Se souvenir de moi</label>

        <button type="submit">Se connecter</button>
    </form>
    <p>Pas de compte ? <a href="{{ route('register') }}">S'inscrire</a></p>
@endsection
