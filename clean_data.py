import csv
import json
from collections import defaultdict

def clean_data(input_csv, output_json):
    items = []
    brand_revenue = defaultdict(float)
    type_counts = defaultdict(int)
    
    total_revenue = 0.0
    total_sold = 0
    total_price = 0.0
    valid_count = 0

    with open(input_csv, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                price = float(row.get('price', '').replace(',', ''))
            except ValueError:
                continue
            
            sold_str = row.get('sold', '0').replace(',', '')
            try:
                sold = int(sold_str)
            except ValueError:
                sold = 0
                
            brand = row.get('brand', 'Unknown')
            if not brand:
                brand = 'Unknown'
                
            item_type = row.get('type', 'Unknown')
            if not item_type:
                item_type = 'Unknown'
                
            loc = row.get('itemLocation', '')
            country = loc.split(',')[-1].strip() if loc else 'Unknown'
            
            revenue = price * sold
            
            # Aggregations
            brand_revenue[brand] += revenue
            type_counts[item_type] += 1
            
            total_revenue += revenue
            total_sold += sold
            total_price += price
            valid_count += 1
            
            items.append({
                'brand': brand,
                'title': row.get('title', ''),
                'price': price,
                'sold': sold,
                'revenue': revenue,
                'country': country,
                'type': item_type
            })

    # Sort brand_revenue
    top_brands = sorted([{'brand': k, 'revenue': v} for k, v in brand_revenue.items()], key=lambda x: x['revenue'], reverse=True)[:10]
    top_types = sorted([{'type': k, 'count': v} for k, v in type_counts.items()], key=lambda x: x['count'], reverse=True)[:5]
    
    avg_price = total_price / valid_count if valid_count > 0 else 0

    dashboard_data = {
        'kpis': {
            'totalRevenue': total_revenue,
            'totalSold': total_sold,
            'averagePrice': avg_price,
            'totalListings': valid_count
        },
        'topBrands': top_brands,
        'topTypes': top_types,
        'items': items
    }
    
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(dashboard_data, f)
        
    print(f"Data cleaned and saved to {output_json} (Processed {valid_count} valid items)")

if __name__ == '__main__':
    clean_data('ebay_mens_perfume.csv', 'dashboard_data.json')
