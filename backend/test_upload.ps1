$formData = @{
    'resume_file' = Get-Item 'test_resume.txt'
    'job_description' = 'Software Developer position requiring Python and JavaScript skills'
}

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:8000/api/ai/test-analyze-resume-file' -Method POST -Form $formData
    Write-Host "Success: " $response.StatusCode
    Write-Host "Content: " $response.Content
} catch {
    Write-Host "Error: " $_.Exception.Message
    Write-Host "Response: " $_.Exception.Response
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: " $responseBody
    }
}
