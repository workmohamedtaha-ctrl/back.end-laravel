@extends('layouts.app')

@section('title', 'Nouvelle tâche')

@section('content')
    <h2>Nouvelle tâche</h2>
    <form method="POST" action="{{ route('tasks.store') }}">
        @csrf

        <label>Titre</label>
        <input type="text" name="title" value="{{ old('title') }}" required>
        @error('title') <div class="error">{{ $message }}</div> @enderror

        <label>Description</label>
        <input type="text" name="description" value="{{ old('description') }}">
        @error('description') <div class="error">{{ $message }}</div> @enderror

        <button type="submit">Ajouter</button>
    </form>
    <p><a href="{{ route('tasks.index') }}">Retour</a></p>
@endsection