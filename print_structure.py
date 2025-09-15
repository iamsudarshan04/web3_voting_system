import os

project_structure = {
    "web3-voting-system": {
        "frontend": {
            "src": {
                "components": [],
                "pages": [],
                "services": [],
                "utils": [],
                "hooks": []
            },
            "public": []
        },
        "backend": {
            "contracts": [],
            "scripts": [],
            "test": []
        },
        "docs": []
    }
}

def print_structure(structure, indent=0):
    for key, value in structure.items():
        print("  " * indent + f" {key}/")
        if isinstance(value, dict):
            print_structure(value, indent + 1)
        elif isinstance(value, list):
            for item in value:
                print("  " * (indent + 1) + f" {item}")

print(" Web3 Voting System Project Structure:")
print_structure(project_structure)
