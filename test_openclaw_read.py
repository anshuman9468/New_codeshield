from tools.openclaw import OpenClaw

oc = OpenClaw()

print("=== Listing files in D:\\sample project ===")
list_result = oc.list_files(r"D:\sample project")
print(list_result)
print()

if list_result.get("success"):
    files = list_result.get("files", [])
    for f in files:
        if f.endswith('.py'):
            full_path = r"D:\sample project\\" + f
            print(f"=== Reading {full_path} ===")
            read_result = oc.read_file(full_path)
            print(read_result)
            print()
