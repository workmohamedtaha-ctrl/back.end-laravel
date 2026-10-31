@extends('layouts.app')

@section('title', 'Mes tâches')

@section('content')
    <h2>Mes tâches</h2>
    <p>Bonjour {{ auth()->user()->name }}</p>
    <a href="{{ route('tasks.create') }}">+ Nouvelle tâche</a>

    @forelse ($tasks as $task)
        <div style="border-bottom:1px solid #eee; padding:12px 0;">
            <strong style="{{ $task->is_done ? 'text-decoration:line-through; color:#888;' : '' }}">{{ $task->title }}</strong>
            <div>{{ $task->description }}</div>
            <a href="{{ route('tasks.edit', $task) }}">Modifier</a>

            <form method="POST" action="{{ route('tasks.destroy', $task) }}" style="display:inline" onsubmit="return confirm('Supprimer cette tâche ?')">
                @csrf
                @method('DELETE')
                <button type="submit" style="width:auto; margin:0 0 0 10px; padding:4px 10px; background:#dc2626; font-size:14px;">Supprimer</button>
            </form>
        </div>
    @empty
        <p>Aucune tâche pour le moment.</p>
    @endforelse

    <form method="POST" action="{{ route('logout') }}">
        @csrf
        <button type="submit" style="background:#6b7280;">Se déconnecter</button>
    </form>
@endsection
