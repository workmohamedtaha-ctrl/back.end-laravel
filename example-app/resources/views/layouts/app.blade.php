<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'TaskApp')</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; }
        .box { max-width: 420px; margin: 60px auto; background: #fff; padding: 28px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,.08); }
        label { display: block; margin: 14px 0 4px; font-weight: bold; }
        input { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 6px; }
        button { margin-top: 18px; width: 100%; padding: 11px; background: #2563eb; color: #fff; border: 0; border-radius: 6px; cursor: pointer; font-size: 16px; }
        .error { color: #dc2626; font-size: 14px; margin-top: 4px; }
    </style>
</head>
<body>
    <div class="box">
        @yield('content')
    </div>
</body>
</html>