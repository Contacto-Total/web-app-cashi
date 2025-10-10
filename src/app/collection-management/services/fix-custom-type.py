import re

with open('system-config.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix getManagementClassifications to include CUSTOM type
old_filter = ".filter(c => c.classificationType === 'MANAGEMENT_TYPE' && c.isEnabled)"
new_filter = ".filter(c => (c.classificationType === 'MANAGEMENT_TYPE' || c.classificationType === 'CUSTOM') && c.isEnabled)"

content = content.replace(old_filter, new_filter)

with open('system-config.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("OK - CUSTOM type added to filter")
