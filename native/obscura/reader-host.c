#ifndef UNICODE
#define UNICODE
#endif
#define _UNICODE
#define _WIN32_WINNT 0x0A00
#include <windows.h>
#include <userenv.h>
#include <aclapi.h>
#include <shlwapi.h>
#include <stdio.h>
#include <wchar.h>
#include <wctype.h>

/* This trusted launcher has no page parser. The only child is the adjacent,
 * manifest-verified Obscura binary. No network capabilities are granted.
 * Start suspended, verify the token, assign the job, then resume. */
static DWORD grant(PCWSTR file, PSID sid, DWORD rights, ACCESS_MODE mode) {
    PACL old = NULL, updated = NULL; PSECURITY_DESCRIPTOR descriptor = NULL;
    DWORD result = GetNamedSecurityInfoW((LPWSTR)file, SE_FILE_OBJECT,
        DACL_SECURITY_INFORMATION, NULL, NULL, &old, NULL, &descriptor);
    if (result) return result;
    EXPLICIT_ACCESSW entry = {0}; entry.grfAccessPermissions = rights;
    entry.grfAccessMode = mode; entry.grfInheritance = NO_INHERITANCE;
    entry.Trustee.TrusteeForm = TRUSTEE_IS_SID;
    entry.Trustee.TrusteeType = TRUSTEE_IS_UNKNOWN; entry.Trustee.ptstrName = (LPWSTR)sid;
    result = SetEntriesInAclW(1, &entry, old, &updated);
    if (!result) result = SetNamedSecurityInfoW((LPWSTR)file, SE_FILE_OBJECT,
        DACL_SECURITY_INFORMATION, NULL, NULL, updated, NULL);
    if (updated) LocalFree(updated);
    LocalFree(descriptor); return result;
}
int wmain(int argc, wchar_t **argv) {
    DWORD exitCode = 125; PSID sid = NULL; HANDLE job = NULL, token = NULL;
    PROCESS_INFORMATION process = {0}; STARTUPINFOEXW start = {0};
    wchar_t binary[MAX_PATH], folder[MAX_PATH], page[MAX_PATH], url[2048], command[4096];
    wchar_t profile[64], environment[4096], windows[MAX_PATH], localAppData[MAX_PATH];
    int stage = 1; DWORD failure = 0; BOOL created = FALSE, attributesReady = FALSE; SIZE_T attributeBytes = 0;
    if (!GetModuleFileNameW(NULL, binary, MAX_PATH) || !PathRemoveFileSpecW(binary)) return 125;
    wcscpy(folder, binary); if (!PathAppendW(binary, L"obscura.exe")) return 125;
    /* Profile identity is local to this installation, so test copies or another
     * installed version cannot remove this reader's profile. */
    unsigned long long scope = 14695981039346656037ULL;
    for (const wchar_t *p=folder; *p; p++) {scope ^= (unsigned long long)towlower(*p); scope *= 1099511628211ULL;}
    swprintf(profile, 64, L"Synapse.Reader.%016llx", scope);
    if (FAILED(DeriveAppContainerSidFromAppContainerName(profile, &sid))) return 125;
    if (argc == 2 && wcscmp(argv[1], L"--cleanup") == 0) {
        FreeSid(sid); HRESULT removed = DeleteAppContainerProfile(profile);
        return SUCCEEDED(removed) || removed == HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND) ? 0 : 125;
    }
    if (argc == 2 && wcscmp(argv[1], L"--prepare") == 0) {
        DWORD prepared = grant(folder, sid, FILE_GENERIC_READ | FILE_GENERIC_EXECUTE, GRANT_ACCESS) |
            grant(binary, sid, FILE_GENERIC_READ | FILE_GENERIC_EXECUTE, GRANT_ACCESS);
        FreeSid(sid); return prepared ? 125 : 0;
    }
    if (argc != 2 || wcslen(argv[1]) > MAX_PATH-20 || !PathIsDirectoryW(argv[1]) ||
        PathIsRelativeW(argv[1]) || wcschr(argv[1], L'"')) return 125;
    swprintf(page, MAX_PATH, L"%ls\\page.html", argv[1]);
    DWORD urlSize = 2048;
    if (FAILED(UrlCreateFromPathW(page, url, &urlSize, 0))) return 125;
    FreeSid(sid); sid = NULL;
    if (FAILED(CreateAppContainerProfile(profile, L"Synapse offline reader", L"No network capabilities", NULL, 0, &sid))) return 125;
    if (grant(argv[1], sid, FILE_GENERIC_READ | FILE_GENERIC_EXECUTE, GRANT_ACCESS) ||
        grant(page, sid, FILE_GENERIC_READ, GRANT_ACCESS)) goto cleanup;
    stage = 2;
    job = CreateJobObjectW(NULL, NULL); if (!job) goto cleanup;
    JOBOBJECT_EXTENDED_LIMIT_INFORMATION limits = {0};
    limits.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE |
        JOB_OBJECT_LIMIT_ACTIVE_PROCESS | JOB_OBJECT_LIMIT_PROCESS_MEMORY |
        JOB_OBJECT_LIMIT_PROCESS_TIME | JOB_OBJECT_LIMIT_DIE_ON_UNHANDLED_EXCEPTION;
    limits.BasicLimitInformation.ActiveProcessLimit = 1;
    limits.BasicLimitInformation.PerProcessUserTimeLimit.QuadPart = 10LL * 10000000;
    limits.ProcessMemoryLimit = (SIZE_T)1024 * 1024 * 1024;
    if (!SetInformationJobObject(job, JobObjectExtendedLimitInformation, &limits, sizeof(limits))) goto cleanup;
    stage = 3;
    InitializeProcThreadAttributeList(NULL, 2, 0, &attributeBytes);
    start.lpAttributeList = HeapAlloc(GetProcessHeap(), 0, attributeBytes);
    if (!start.lpAttributeList || !InitializeProcThreadAttributeList(start.lpAttributeList, 2, 0, &attributeBytes)) goto cleanup;
    stage = 4;
    attributesReady = TRUE;
    SECURITY_CAPABILITIES capabilities = {0}; capabilities.AppContainerSid = sid;
    if (!UpdateProcThreadAttribute(start.lpAttributeList, 0, PROC_THREAD_ATTRIBUTE_SECURITY_CAPABILITIES,
        &capabilities, sizeof(capabilities), NULL, NULL)) goto cleanup;
    stage = 5;
    HANDLE handles[3] = {GetStdHandle(STD_INPUT_HANDLE), GetStdHandle(STD_OUTPUT_HANDLE), GetStdHandle(STD_ERROR_HANDLE)};
    for (int n=0; n<3; n++) if (!SetHandleInformation(handles[n], HANDLE_FLAG_INHERIT, HANDLE_FLAG_INHERIT)) goto cleanup;
    if (!UpdateProcThreadAttribute(start.lpAttributeList, 0, PROC_THREAD_ATTRIBUTE_HANDLE_LIST,
        handles, sizeof(handles), NULL, NULL)) goto cleanup;
    start.StartupInfo.cb = sizeof(start); start.StartupInfo.dwFlags = STARTF_USESTDHANDLES;
    start.StartupInfo.hStdInput = handles[0]; start.StartupInfo.hStdOutput = handles[1]; start.StartupInfo.hStdError = handles[2];
    stage = 6;
    GetWindowsDirectoryW(windows, MAX_PATH);
    /* Sorted, explicit environment block; no inherited keys, proxy, home or PATH. */
    if (!GetEnvironmentVariableW(L"LOCALAPPDATA", localAppData, MAX_PATH)) goto cleanup;
    int chars = swprintf(environment, 4096,
        L"DO_NOT_TRACK=1%cLOCALAPPDATA=%ls%cOBSCURA_ALLOW_PRIVATE_NETWORK=0%cOBSCURA_FETCH_TIMEOUT_MS=3000%cOBSCURA_SCRIPT_DEADLINE_MS=3000%cRUST_LOG=off%cSystemRoot=%ls%cTEMP=%ls%cTMP=%ls%c%c",
        0,localAppData,0,0,0,0,0,windows,0,argv[1],0,argv[1],0,0);
    if (chars < 0) goto cleanup;
    swprintf(command, 4096, L"\"%ls\" fetch \"%ls\" --dump text --wait 0 --timeout 10 --quiet", binary, url);
    stage = 7;
    if (!CreateProcessW(binary, command, NULL, NULL, TRUE,
        EXTENDED_STARTUPINFO_PRESENT | CREATE_SUSPENDED | CREATE_NO_WINDOW | CREATE_UNICODE_ENVIRONMENT,
        environment, argv[1], &start.StartupInfo, &process)) goto cleanup;
    created = TRUE;
    stage = 8;
    DWORD isContainer = 0, returned = 0; BYTE info[1024];
    if (!OpenProcessToken(process.hProcess, TOKEN_QUERY, &token) ||
        !GetTokenInformation(token, TokenIsAppContainer, &isContainer, sizeof(isContainer), &returned) || !isContainer ||
        !GetTokenInformation(token, TokenAppContainerSid, info, sizeof(info), &returned) ||
        !EqualSid(((TOKEN_APPCONTAINER_INFORMATION*)info)->TokenAppContainer, sid) ||
        !GetTokenInformation(token, TokenCapabilities, info, sizeof(info), &returned) ||
        ((TOKEN_GROUPS*)info)->GroupCount != 0 || !AssignProcessToJobObject(job, process.hProcess)) goto cleanup;
    stage = 9;
    if (ResumeThread(process.hThread) == (DWORD)-1) goto cleanup;
    if (WaitForSingleObject(process.hProcess, 15000) == WAIT_OBJECT_0)
        GetExitCodeProcess(process.hProcess, &exitCode);
cleanup:
    failure = GetLastError();
    if (created) {TerminateProcess(process.hProcess, 125); WaitForSingleObject(process.hProcess, 2000);}
    if (job) {TerminateJobObject(job, 125); CloseHandle(job);}
    if (token) CloseHandle(token);
    if (process.hThread) CloseHandle(process.hThread);
    if (process.hProcess) CloseHandle(process.hProcess);
    if (start.lpAttributeList) {if(attributesReady) DeleteProcThreadAttributeList(start.lpAttributeList); HeapFree(GetProcessHeap(), 0, start.lpAttributeList);}
    if (sid) {
        grant(argv[1], sid, 0, REVOKE_ACCESS); grant(page, sid, 0, REVOKE_ACCESS);
        FreeSid(sid);
        if (FAILED(DeleteAppContainerProfile(profile))) exitCode = 125;
    }
    /* Diagnostics intentionally contain neither URLs nor page text. */
    if (exitCode) fprintf(stderr, "READER_FAILED stage=%d win32=%lu\n", stage, failure);
    return exitCode ? 125 : 0;
}
