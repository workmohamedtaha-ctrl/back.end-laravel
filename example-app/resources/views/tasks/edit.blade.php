@extends('layouts.app')

@section('title', 'Modifier la tâche')

@section('content')
    <h2>Modifier la tâche</h2>
    <form method="POST" action="{{ route('tasks.update', $task) }}">
        @csrf
        @method('PUT')

        <label>Titre</label>
        <input type="text" name="title" value="{{ old('title', $task->title) }}" required>
        @error('title') <div class="error">{{ $message }}</div> @enderror

        <label>Description</label>
        <input type="text" name="description" value="{{ old('description', $task->description) }}">
        @error('description') <div class="error">{{ $message }}</div> @enderror

        <label><input type="checkbox" name="is_done" value="1" style="width:auto" {{ $task->is_done ? 'checked' : '' }}> Terminée</label>

        <button type="submit">Enregistrer</button>
    </form>
    <p><a href="{{ route('tasks.index') }}">Retour</a></p>
@endsection
