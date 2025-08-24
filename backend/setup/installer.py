import subprocess
import sys, os
import winreg as reg
import json

RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
CYAN = "\033[36m"

BOLD = "\033[1m"
RESET = "\033[0m"

def main():
    try:
        version = sys.version_info
        if version < (3, 12, 5):
            print(f"{RED}{BOLD}[!] Pythonversion is outdated, please update to 3.12.5 or higher{RESET}")
            sys.exit(1)

        else:
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", os.path.join(os.path.dirname(os.path.abspath(__file__)), "requirements.txt")])
            print(f"{GREEN}{BOLD}[+] All required packages are installed{RESET}")
            print(f"{BLUE}[~] Registering Native Messaging Host for {RESET}{YELLOW}Chrome{RESET}")
            
            host_name = "com.native.locker"
            print(f"{BLUE}[~] Host Name: {host_name}{RESET}")
            manifest_path = os.path.join(os.path.dirname(os.path.abspath(__file__)).rsplit("\\", 1)[0], "native_l0ck3r_backend.json")
            print(f"{BLUE}[~] Manifest Path: {manifest_path}{RESET}")
            chrome_key = r"Software\Google\Chrome\NativeMessagingHosts\{}".format(host_name)
            print(f"{BLUE}[~] Registry Key: {chrome_key}{RESET}")
            
            try:
                reg_key = reg.CreateKey(reg.HKEY_CURRENT_USER, chrome_key)
                reg.SetValue(reg_key, "", reg.REG_SZ, manifest_path)
                reg.CloseKey(reg_key)
                
                print(f"{GREEN}{BOLD}[+] Registered Native Messaging Host for Chrome: {host_name}{RESET}")
                print(f"{GREEN}{BOLD}[+] ---> {manifest_path}{RESET}\n")
                print(fr"""{CYAN}{BOLD}
                    __        __   _                            _          __     ___       _   ___         
                    \ \      / /__| | ___ ___  _ __ ___   ___  | |_ ___   |  |   / _ \  ___| |__\_  \ _ __  
                     \ \ /\ / / _ \ |/ __/ _ \| '_ ` _ \ / _ \ | __/ _ \  |  |  |   \ |/ __| | _/(_  \ '__| 
                      \ V  V /  __/ | (_| (_) | | | | | |  __/ | || (_) | |  |__| \_. | (__|  '( __\  \ |   
                       \_/\_/ \___|_|\___\___/|_| |_| |_|\___|  \__\___/  |______\___/ \___\_|__\_____|_|   
                    {RESET}""")
                extension_id = input(f"\n{BOLD}{BLUE}Please provide the extesion ID: {RESET}")
                try:
                    with open(manifest_path, "r") as file:
                        manifest_data = json.load(file)
                        file.close()
                    manifest_data["allowed_origins"] = [f"chrome-extension://{extension_id}/"]
                    
                    with open(manifest_path, "w", encoding="utf-8") as file:
                        json.dump(manifest_data, file, indent=4)
                        file.close()
                    
                    print(f"{GREEN}{BOLD}[+] Installation complete!{RESET}")
                    input("\npress any key to exit...")
                        
                except Exception as e:
                    print(f"{RED}{BOLD}[-] Error writing native-manifest: {e}{RESET}")    
                
            except Exception as e:
                print(f"{RED}{BOLD}[-] Error writing registry: {e}{RESET}")
    except KeyboardInterrupt:
        print(f"\n{YELLOW}{BOLD}[!] Installation cancelled{RESET}")
        sys.exit(0)

if __name__ == "__main__":
    main()