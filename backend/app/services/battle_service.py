"""Battle service for handling combat logic and state management"""

from typing import List, Dict, Optional

class BattleService:
    """Manages battle mechanics and calculations"""
    
    # Battle configuration
    MAX_TIME = 30
    MAX_PLAYER_HP = 300
    MAX_MONSTER_HP = 3000
    
    # Game data
    ELEMENTS = {
        'H': {'name': 'Hydrogen', 'color': '#3b82f6'},
        'O': {'name': 'Oxygen', 'color': '#10b981'},
        'Na': {'name': 'Sodium', 'color': '#eab308'},
        'Cl': {'name': 'Chlorine', 'color': '#84cc16'},
        'C': {'name': 'Carbon', 'color': '#64748b'}
    }
    
    RECIPES = {
        'H2O': {'name': 'Aqua Vitae', 'formula': {'H': 2, 'O': 1}, 'damage': 30, 'status': 'Wet', 'color': '#60a5fa'},
        'HCl': {'name': 'Acid Flask', 'formula': {'H': 1, 'Cl': 1}, 'damage': 80, 'status': 'Corroded', 'color': '#4ade80'},
        'NaCl': {'name': 'Crystal Salt', 'formula': {'Na': 1, 'Cl': 1}, 'damage': 50, 'status': 'Crystalized', 'color': '#fef08a'},
        'NaOH': {'name': 'Caustic Brew', 'formula': {'Na': 1, 'O': 1, 'H': 1}, 'damage': 100, 'status': 'Burned', 'color': '#c084fc'},
        'CO2': {'name': 'Choking Smog', 'formula': {'C': 1, 'O': 2}, 'damage': 20, 'status': 'Suffocated', 'color': '#94a3b8'}
    }
    
    ULTIMATES = {
        'zero': {
            'name': 'ABSOLUTE ZERO',
            'req': ['Wet', 'Suffocated'],
            'dmg': 800,
            'color': '#22d3ee',
            'bgTheme': 'bg-cyan-950',
            'fx': 'iceShatter',
            'desc': 'Freeze the target to atomic standstill.'
        },
        'hellfire': {
            'name': 'HELLFIRE ANNIHILATION',
            'req': ['Burned', 'Corroded'],
            'dmg': 1000,
            'color': '#ef4444',
            'bgTheme': 'bg-red-950',
            'fx': 'fireRise',
            'desc': 'Ignite a chain reaction of pure agony.'
        },
        'nuke': {
            'name': 'PHILOSOPHER\'S NUKE',
            'req': ['Wet', 'Corroded', 'Crystalized'],
            'dmg': 9999,
            'color': '#ffffff',
            'bgTheme': 'bg-white',
            'fx': 'whiteout',
            'desc': 'Erase matter from existence.'
        }
    }
    
    @staticmethod
    def validate_recipe(crucible: List[str]) -> Optional[Dict]:
        """
        Validate if a crucible matches a known recipe
        
        Args:
            crucible: List of element symbols
            
        Returns:
            Recipe data if match found, None otherwise
        """
        if not crucible:
            return None
        
        # Count elements in crucible
        counts = {}
        for el in crucible:
            counts[el] = counts.get(el, 0) + 1
        
        # Check against recipes
        for recipe_id, recipe_data in BattleService.RECIPES.items():
            formula = recipe_data['formula']
            
            # Check if both have same elements
            if set(formula.keys()) != set(counts.keys()):
                continue
            
            # Check if counts match
            if all(formula[el] == counts[el] for el in formula.keys()):
                return {'id': recipe_id, **recipe_data}
        
        return None
    
    @staticmethod
    def calculate_qte_damage(base_damage: int, qte_result: str) -> int:
        """
        Calculate damage based on QTE result
        
        Args:
            base_damage: Base damage of the attack
            qte_result: Result of QTE ('PERFECT', 'GOOD', 'MISS')
            
        Returns:
            Final damage value
        """
        multipliers = {
            'PERFECT': 1.5,
            'GOOD': 1.0,
            'MISS': 0.5
        }
        
        multiplier = multipliers.get(qte_result, 0.5)
        return int(base_damage * multiplier)
    
    @staticmethod
    def check_ultimate_ready(ultimate_id: str, monster_statuses: List[str]) -> bool:
        """
        Check if an ultimate ability can be executed
        
        Args:
            ultimate_id: ID of the ultimate
            monster_statuses: List of current status effects
            
        Returns:
            True if all requirements are met
        """
        if ultimate_id not in BattleService.ULTIMATES:
            return False
        
        ult = BattleService.ULTIMATES[ultimate_id]
        return all(status in monster_statuses for status in ult['req'])
    
    @staticmethod
    def calculate_monster_damage() -> int:
        """Calculate random monster attack damage"""
        import random
        return random.randint(40, 70)
    
    @staticmethod
    def get_ultimate_data(ultimate_id: str) -> Optional[Dict]:
        """
        Get full data for an ultimate ability
        
        Args:
            ultimate_id: ID of the ultimate
            
        Returns:
            Ultimate data if found, None otherwise
        """
        return BattleService.ULTIMATES.get(ultimate_id)


# Initialize service
battle_service = BattleService()
