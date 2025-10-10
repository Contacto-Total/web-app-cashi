import re

with open('api-system-config.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace classificationsUrl definition
content = re.sub(
    r'private readonly classificationsUrl = `\$\{environment\.apiUrl\}/classifications`;',
    'private readonly apiUrl = environment.apiUrl;',
    content
)

# Replace all uses of classificationsUrl with apiUrl
content = content.replace('${this.classificationsUrl}/tenants', '${this.apiUrl}/tenants')

with open('api-system-config.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ URLs corregidas")
