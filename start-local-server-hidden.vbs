Option Explicit

Dim shell, fso, root, nodePath, command
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

root = "E:\ASK REAL ESTATE FAISALABAD 1"
nodePath = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.16.0-win-x64\node.exe"

If fso.FileExists(nodePath) Then
    command = "cmd /c cd /d " & Chr(34) & root & Chr(34) & " && " & Chr(34) & nodePath & Chr(34) & " node-local-server.js"
Else
    command = "cmd /c cd /d " & Chr(34) & root & Chr(34) & " && node node-local-server.js"
End If

shell.Run command, 0, False
WScript.Sleep 1200
shell.Run "http://localhost:8000/", 1, False
