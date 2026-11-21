/* Test fixture only. Never packaged. Tests OS restrictions independently of V8. */
#define _WIN32_WINNT 0x0A00
#include <winsock2.h>
#include <windows.h>
#include <stdio.h>
#include <wchar.h>
#include <string.h>

static int blocked(const char *ip, int port) {
    SOCKET socketHandle = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if(socketHandle == INVALID_SOCKET) return 1;
    u_long nonblocking = 1; ioctlsocket(socketHandle, FIONBIO, &nonblocking);
    struct sockaddr_in address = {0}; address.sin_family = AF_INET;
    address.sin_port = htons((u_short)port); address.sin_addr.s_addr = inet_addr(ip);
    int connected = connect(socketHandle, (struct sockaddr*)&address, sizeof(address));
    if(connected == 0) {closesocket(socketHandle); return 0;}
    int error = WSAGetLastError();
    if(error == WSAEWOULDBLOCK) {
        fd_set writable,failed; FD_ZERO(&writable); FD_ZERO(&failed);
        FD_SET(socketHandle,&writable); FD_SET(socketHandle,&failed);
        struct timeval timeout = {2,0};
        if(select(0,NULL,&writable,&failed,&timeout)>0) {
            int size=sizeof(error);getsockopt(socketHandle,SOL_SOCKET,SO_ERROR,(char*)&error,&size);
        }
    }
    /* Public egress must return explicit access denied. Windows can silently
     * drop isolated loopback SYNs; that case is tested against a known live
     * listener, with successful broker control requests before/after. */
    closesocket(socketHandle); return error == WSAEACCES ||
        (strcmp(ip,"127.0.0.1")==0 && (error==WSAECONNREFUSED || error==WSAEWOULDBLOCK));
}
int main(void) {
    char mode[32] = {0}, secret[1024] = {0}; FILE *file = fopen("page.html", "r");
    if(!file) return 2;
    char portText[16]={0};
    fgets(mode, sizeof(mode), file); fgets(secret, sizeof(secret), file); fgets(portText,sizeof(portText),file); fclose(file);
    secret[strcspn(secret,"\r\n")] = 0;
    if(strncmp(mode,"hang",4)==0) {printf("%lu\n",GetCurrentProcessId());fflush(stdout);Sleep(60000);return 0;}
    if(strncmp(mode,"flood",5)==0) {for(int n=0;n<500000;n++)putchar('x');fflush(stdout);Sleep(60000);return 0;}
    HANDLE token; DWORD container = 0, bytes = 0; BYTE caps[1024];
    if(!OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &token)) return 2;
    GetTokenInformation(token, TokenIsAppContainer, &container, sizeof(container), &bytes);
    GetTokenInformation(token, TokenCapabilities, caps, sizeof(caps), &bytes); CloseHandle(token);
    wchar_t secretWide[1024]; MultiByteToWideChar(CP_UTF8,0,secret,-1,secretWide,1024);
    HANDLE read = CreateFileW(secretWide, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, 0, NULL);
    int privateReadDenied = read == INVALID_HANDLE_VALUE && GetLastError()==ERROR_ACCESS_DENIED;
    if(read != INVALID_HANDLE_VALUE)CloseHandle(read);
    HANDLE write = CreateFileW(L"page.html", GENERIC_WRITE, 0, NULL, OPEN_EXISTING, 0, NULL);
    int writeDenied = write == INVALID_HANDLE_VALUE && GetLastError()==ERROR_ACCESS_DENIED;
    if(write != INVALID_HANDLE_VALUE)CloseHandle(write);
    WSADATA wsa; WSAStartup(MAKEWORD(2,2),&wsa);
    int privateNetworkDenied = blocked("127.0.0.1",atoi(portText)),publicNetworkDenied = blocked("1.1.1.1",443); WSACleanup();
    JOBOBJECT_EXTENDED_LIMIT_INFORMATION limits = {0};
    int job = QueryInformationJobObject(NULL,JobObjectExtendedLimitInformation,&limits,sizeof(limits),NULL);
    wchar_t binary[MAX_PATH],command[MAX_PATH+8]; GetModuleFileNameW(NULL,binary,MAX_PATH);
    swprintf(command,MAX_PATH+8,L"\"%ls\"",binary);
    STARTUPINFOW start = {0}; start.cb=sizeof(start); PROCESS_INFORMATION child={0};
    int childDenied = !CreateProcessW(binary,command,NULL,NULL,FALSE,CREATE_NO_WINDOW,NULL,NULL,&start,&child);
    if(!childDenied){TerminateProcess(child.hProcess,1);CloseHandle(child.hProcess);CloseHandle(child.hThread);}
    printf("{\"container\":%lu,\"capabilities\":%lu,\"privateReadDenied\":%d,\"writeDenied\":%d,\"privateNetworkDenied\":%d,\"publicNetworkDenied\":%d,\"childDenied\":%d,\"job\":%d,\"activeLimit\":%lu,\"memoryLimit\":%llu,\"environmentClean\":%d}\n",
        container,((TOKEN_GROUPS*)caps)->GroupCount,privateReadDenied,writeDenied,privateNetworkDenied,publicNetworkDenied,childDenied,job,
        limits.BasicLimitInformation.ActiveProcessLimit,(unsigned long long)limits.ProcessMemoryLimit,
        GetEnvironmentVariableA("LOS_TEST_SECRET",NULL,0)==0 && GetEnvironmentVariableA("PATH",NULL,0)==0);
    return 0;
}
