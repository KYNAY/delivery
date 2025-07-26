@echo off
REM Verifica se uma mensagem de commit foi fornecida.
if "%~1"=="" (
    echo.
    echo ERRO: Voce precisa fornecer uma mensagem para o commit entre aspas.
    echo.
    echo Exemplo de uso:
    echo update_github.bat "Corrigi o bug do botao azul"
    echo.
    pause
    exit /b
)

echo.
echo --- INICIANDO ATUALIZACAO DO GITHUB ---
echo.

echo [1/3] Adicionando todos os arquivos...
git add .
echo Arquivos adicionados.
echo.

echo [2/3] Criando commit com a mensagem: %1
git commit -m %1
echo Commit criado.
echo.

echo [3/3] Enviando para o GitHub...
git push
echo.
echo --- ATUALIZACAO CONCLUIDA ---
pause
