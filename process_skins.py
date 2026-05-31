import json
import random

def get_type(item):
    category = item.get('category', {}).get('name', '')
    weapon = item.get('weapon', {}).get('name', '')
    
    if category == 'Gloves':
        return 'Gloves'
    if category == 'Knives':
        return 'Knife'
    
    rifles = ['AK-47', 'M4A4', 'M4A1-S', 'AUG', 'SG 553', 'FAMAS', 'Galil AR']
    snipers = ['AWP', 'SSG 08', 'SCAR-20', 'G3SG1']
    pistols = ['Glock-18', 'USP-S', 'P2000', 'Desert Eagle', 'P250', 'Five-SeveN', 'Tec-9', 'Dual Berettas', 'CZ75-Auto', 'R8 Revolver']
    smgs = ['MAC-10', 'MP9', 'MP7', 'MP5-SD', 'UMP-45', 'P90', 'PP-Bizon']
    
    if weapon in rifles: return 'Rifle'
    if weapon in snipers: return 'Sniper'
    if weapon in pistols: return 'Pistol'
    if weapon in smgs: return 'SMG'
    return None

def get_rarity(item):
    rarity = item.get('rarity', {}).get('name', '')
    # Map Extraordinary/Ancient to Covert for diversity if needed, 
    # but the user specifically asked for Covert, Classified, Restricted, Mil-Spec.
    # Knives/Gloves are usually "Covert" or "Extraordinary".
    if rarity in ['Covert', 'Extraordinary', 'Ancient']:
        return 'Covert'
    if rarity == 'Classified':
        return 'Classified'
    if rarity == 'Restricted':
        return 'Restricted'
    if rarity == 'Mil-Spec Grade':
        return 'Mil-Spec'
    return None

def generate_price(item_type, rarity):
    if item_type in ['Knife', 'Gloves']:
        return round(random.uniform(150, 10000), 2)
    
    base_prices = {
        'Covert': (50, 2000),
        'Classified': (10, 500),
        'Restricted': (5, 100),
        'Mil-Spec': (1, 30)
    }
    
    low, high = base_prices.get(rarity, (5, 50))
    # Ensure it's at least $5 as per request
    price = random.uniform(max(5, low), high)
    return round(price, 2)

with open('skins_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

processed_skins = []
types_count = {
    'Knife': 0, 'Gloves': 0, 'Rifle': 0, 'Sniper': 0, 'Pistol': 0, 'SMG': 0
}

# Target: 100 skins total, ~16-17 of each type
target_per_type = 100 // 6

# Shuffle to get diversity
random.shuffle(data)

for item in data:
    if len(processed_skins) >= 100:
        break
        
    t = get_type(item)
    r = get_rarity(item)
    
    if t and r:
        if types_count[t] < target_per_type or (len(processed_skins) < 100 and sum(types_count.values()) < 100):
            # Also need collection
            collection = "Unknown"
            if item.get('collections') and len(item['collections']) > 0:
                collection = item['collections'][0].get('name', 'Unknown')
            elif item.get('crates') and len(item['crates']) > 0:
                collection = item['crates'][0].get('name', 'Unknown')

            processed_skins.append({
                "name": item['name'],
                "type": t,
                "rarity": r,
                "collection": collection,
                "price": generate_price(t, r)
            })
            types_count[t] += 1

# If we didn't reach 100 because of strict target_per_type, we might need more
# But with shuffle and large dataset we should be fine.

print(json.dumps(processed_skins[:100], indent=2))
