export const ELEMENT_CATEGORIES = {
  'alkali': { name: 'Alkali Metal', color: '#ef4444' },
  'alkaline-earth': { name: 'Alkaline Earth Metal', color: '#f97316' },
  'transition': { name: 'Transition Metal', color: '#f59e0b' },
  'post-transition': { name: 'Post-transition Metal', color: '#10b981' },
  'metalloid': { name: 'Metalloid', color: '#06b6d4' },
  'nonmetal': { name: 'Reactive Nonmetal', color: '#3b82f6' },
  'noble-gas': { name: 'Noble Gas', color: '#8b5cf6' },
  'lanthanide': { name: 'Lanthanide', color: '#ec4899' },
  'actinide': { name: 'Actinide', color: '#f43f5e' },
  'unknown': { name: 'Unknown', color: '#64748b' }
};

export const PERIODIC_TABLE_DATA = [
  // Row 1
  { num: 1, symbol: 'H', name: 'Hydrogen', category: 'nonmetal', x: 1, y: 1, weight: 1.008, desc: 'The lightest element, fueling the sun and marking the start of all matter.' },
  { num: 2, symbol: 'He', name: 'Helium', category: 'noble-gas', x: 18, y: 1, weight: 4.002, desc: 'A stable, inert gas used in balloons and cooling superconducting magnets.' },
  
  // Row 2
  { num: 3, symbol: 'Li', name: 'Lithium', category: 'alkali', x: 1, y: 2, weight: 6.941, desc: 'A soft, silvery-white metal used in high-performance batteries.' },
  { num: 4, symbol: 'Be', name: 'Beryllium', category: 'alkaline-earth', x: 2, y: 2, weight: 9.012, desc: 'A strong, lightweight metal used in aerospace and X-ray windows.' },
  { num: 5, symbol: 'B', name: 'Boron', category: 'metalloid', x: 13, y: 2, weight: 10.81, desc: 'Used in borosilicate glass and as a crucial nutrient for plants.' },
  { num: 6, symbol: 'C', name: 'Carbon', category: 'nonmetal', x: 14, y: 2, weight: 12.01, desc: 'The backbone of life, from diamonds to DNA.' },
  { num: 7, symbol: 'N', name: 'Nitrogen', category: 'nonmetal', x: 15, y: 2, weight: 14.01, desc: 'Makes up 78% of Earth\'s atmosphere and is essential for fertilizers.' },
  { num: 8, symbol: 'O', name: 'Oxygen', category: 'nonmetal', x: 16, y: 2, weight: 16.00, desc: 'A highly reactive gas essential for respiration and combustion.' },
  { num: 9, symbol: 'F', name: 'Fluorine', category: 'nonmetal', x: 17, y: 2, weight: 19.00, desc: 'The most electronegative element, found in toothpaste and refrigerants.' },
  { num: 10, symbol: 'Ne', name: 'Neon', category: 'noble-gas', x: 18, y: 2, weight: 20.18, desc: 'A noble gas famous for its brilliant reddish-orange glow in signs.' },
  
  // Row 3
  { num: 11, symbol: 'Na', name: 'Sodium', category: 'alkali', x: 1, y: 3, weight: 22.99, desc: 'A highly reactive metal that explodes in water; found in table salt.' },
  { num: 12, symbol: 'Mg', name: 'Magnesium', category: 'alkaline-earth', x: 2, y: 3, weight: 24.31, desc: 'A lightweight metal essential for photosynthesis and many body functions.' },
  { num: 13, symbol: 'Al', name: 'Aluminum', category: 'post-transition', x: 13, y: 3, weight: 26.98, desc: 'The most abundant metal in Earth\'s crust, used in cans and aircraft.' },
  { num: 14, symbol: 'Si', name: 'Silicon', category: 'metalloid', x: 14, y: 3, weight: 28.09, desc: 'The foundation of the digital age, found in chips and glass.' },
  { num: 15, symbol: 'P', name: 'Phosphorus', category: 'nonmetal', x: 15, y: 3, weight: 30.97, desc: 'Required for DNA and ATP; often found in matches and fertilizers.' },
  { num: 16, symbol: 'S', name: 'Sulfur', category: 'nonmetal', x: 16, y: 3, weight: 32.06, desc: 'A yellow element known for its smell in volcanoes and gunpowder.' },
  { num: 17, symbol: 'Cl', name: 'Chlorine', category: 'nonmetal', x: 17, y: 3, weight: 35.45, desc: 'A toxic greenish gas used for pool cleaning and salt production.' },
  { num: 18, symbol: 'Ar', name: 'Argon', category: 'noble-gas', x: 18, y: 3, weight: 39.95, desc: 'The third most abundant gas in Earth\'s atmosphere, used in lightbulbs.' },

  // Add more as needed... I'll stop at row 3 for now but provide placeholders or more if I can.
  // Row 4
  { num: 19, symbol: 'K', name: 'Potassium', category: 'alkali', x: 1, y: 4, weight: 39.098, desc: 'A soft, silvery metal that reacts violently with water; vital for nerve function.' },
  { num: 20, symbol: 'Ca', name: 'Calcium', category: 'alkaline-earth', x: 2, y: 4, weight: 40.078, desc: 'Essential for bones, teeth, and building materials like cement.' },
  { num: 21, symbol: 'Sc', name: 'Scandium', category: 'transition', x: 3, y: 4, weight: 44.956, desc: 'Used in sports equipment and high-intensity lamps.' },
  { num: 22, symbol: 'Ti', name: 'Titanium', category: 'transition', x: 4, y: 4, weight: 47.867, desc: 'Strong as steel but much lighter; highly resistant to corrosion.' },
  { num: 23, symbol: 'V', name: 'Vanadium', category: 'transition', x: 5, y: 4, weight: 50.942, desc: 'Used to create extremely strong steel alloys for tools.' },
  { num: 24, symbol: 'Cr', name: 'Chromium', category: 'transition', x: 6, y: 4, weight: 51.996, desc: 'The hard, shiny metal used in "chrome" plating and stainless steel.' },
  { num: 25, symbol: 'Mn', name: 'Manganese', category: 'transition', x: 7, y: 4, weight: 54.938, desc: 'Crucial for steel strength and clear glass production.' },
  { num: 26, symbol: 'Fe', name: 'Iron', category: 'transition', x: 8, y: 4, weight: 55.845, desc: 'The backbone of civilization and the core of Earth.' },
  { num: 27, symbol: 'Co', name: 'Cobalt', category: 'transition', x: 9, y: 4, weight: 58.933, desc: 'Famous for its deep blue color and use in powerful magnets.' },
  { num: 28, symbol: 'Ni', name: 'Nickel', category: 'transition', x: 10, y: 4, weight: 58.693, desc: 'Used in coins and to protect other metals from rusting.' },
  { num: 29, symbol: 'Cu', name: 'Copper', category: 'transition', x: 11, y: 4, weight: 63.546, desc: 'The red metal of electricity and ancient tools.' },
  { num: 30, symbol: 'Zn', name: 'Zinc', category: 'transition', x: 12, y: 4, weight: 65.38, desc: 'Protects steel and is vital for immune health.' },
  { num: 31, symbol: 'Ga', name: 'Gallium', category: 'post-transition', x: 13, y: 4, weight: 69.723, desc: 'A metal that melts in your hand; used in semiconductors.' },
  { num: 32, symbol: 'Ge', name: 'Germanium', category: 'metalloid', x: 14, y: 4, weight: 72.63, desc: 'Essential for fiber optics and infrared night vision.' },
  { num: 33, symbol: 'As', name: 'Arsenic', category: 'metalloid', x: 15, y: 4, weight: 74.922, desc: 'Famous as a poison, but also used in specialized alloys.' },
  { num: 34, symbol: 'Se', name: 'Selenium', category: 'nonmetal', x: 16, y: 4, weight: 78.971, desc: 'Used in solar cells and to make glass red.' },
  { num: 35, symbol: 'Br', name: 'Bromine', category: 'nonmetal', x: 17, y: 4, weight: 79.904, desc: 'The only nonmetal that is a liquid at room temperature.' },
  { num: 36, symbol: 'Kr', name: 'Krypton', category: 'noble-gas', x: 18, y: 4, weight: 83.798, desc: 'A heavy noble gas used in high-speed photography flashes.' },

  // Row 5
  { num: 37, symbol: 'Rb', name: 'Rubidium', category: 'alkali', x: 1, y: 5, weight: 85.468, desc: 'A highly reactive metal that can spontaneously ignite in air.' },
  { num: 38, symbol: 'Sr', name: 'Strontium', category: 'alkaline-earth', x: 2, y: 5, weight: 87.62, desc: 'Famous for the brilliant red color it gives to fireworks.' },
  { num: 39, symbol: 'Y', name: 'Yttrium', category: 'transition', x: 3, y: 5, weight: 88.906, desc: 'Used in lasers and as a component in superconductors.' },
  { num: 40, symbol: 'Zr', name: 'Zirconium', category: 'transition', x: 4, y: 5, weight: 91.224, desc: 'Resistant to corrosion and used in nuclear reactors.' },
  { num: 41, symbol: 'Nb', name: 'Niobium', category: 'transition', x: 5, y: 5, weight: 92.906, desc: 'Used in advanced steel alloys and particle accelerators.' },
  { num: 42, symbol: 'Mo', name: 'Molybdenum', category: 'transition', x: 6, y: 5, weight: 95.95, desc: 'Has one of the highest melting points of any element.' },
  { num: 43, symbol: 'Tc', name: 'Technetium', category: 'transition', x: 7, y: 5, weight: 98, desc: 'The first element to be produced artificially; radioactive.' },
  { num: 44, symbol: 'Ru', name: 'Ruthenium', category: 'transition', x: 8, y: 5, weight: 101.07, desc: 'A rare transition metal used in electrical contacts.' },
  { num: 45, symbol: 'Rh', name: 'Rhodium', category: 'transition', x: 9, y: 5, weight: 102.91, desc: 'One of the rarest and most expensive precious metals.' },
  { num: 46, symbol: 'Pd', name: 'Palladium', category: 'transition', x: 10, y: 5, weight: 106.42, desc: 'Used in catalytic converters and "white gold" jewelry.' },
  { num: 47, symbol: 'Ag', name: 'Silver', category: 'transition', x: 11, y: 5, weight: 107.87, desc: 'The best conductor of heat and electricity among all metals.' },
  { num: 48, symbol: 'Cd', name: 'Cadmium', category: 'transition', x: 12, y: 5, weight: 112.41, desc: 'Used in rechargeable batteries and bright pigments.' },
  { num: 49, symbol: 'In', name: 'Indium', category: 'post-transition', x: 13, y: 5, weight: 114.82, desc: 'A soft metal used to make touchscreens and mirrors.' },
  { num: 50, symbol: 'Sn', name: 'Tin', category: 'post-transition', x: 14, y: 5, weight: 118.71, desc: 'Prevents corrosion and is a key part of bronze and solder.' },
  { num: 51, symbol: 'Sb', name: 'Antimony', category: 'metalloid', x: 15, y: 5, weight: 121.76, desc: 'Used since ancient times in cosmetics and flame retardants.' },
  { num: 52, symbol: 'Te', name: 'Tellurium', category: 'metalloid', x: 16, y: 5, weight: 127.60, desc: 'One of the rarest metalloids, used in solar panels.' },
  { num: 53, symbol: 'I', name: 'Iodine', category: 'nonmetal', x: 17, y: 5, weight: 126.90, desc: 'A shiny purple-black solid essential for thyroid health.' },
  { num: 54, symbol: 'Xe', name: 'Xenon', category: 'noble-gas', x: 18, y: 5, weight: 131.29, desc: 'Used in high-intensity lamps and ion thrusters for spacecraft.' },

  // Key heavy elements
  { num: 74, symbol: 'W', name: 'Tungsten', category: 'transition', x: 7, y: 6, weight: 183.84, desc: 'Has the highest melting point of all elements in pure form.' },
  { num: 78, symbol: 'Pt', name: 'Platinum', category: 'transition', x: 10, y: 6, weight: 195.08, desc: 'A very stable, rare metal used in jewelry and industry.' },
  { num: 79, symbol: 'Au', name: 'Gold', category: 'transition', x: 11, y: 6, weight: 196.97, desc: 'The most malleable metal, prized for its lustrous beauty.' },
  { num: 80, symbol: 'Hg', name: 'Mercury', category: 'transition', x: 12, y: 6, weight: 200.59, desc: 'The only metal that is liquid at standard room temperature.' },
  { num: 82, symbol: 'Pb', name: 'Lead', category: 'post-transition', x: 14, y: 6, weight: 207.2, desc: 'A dense metal used for radiation shielding and batteries.' },
  { num: 92, symbol: 'U', name: 'Uranium', category: 'actinide', x: 6, y: 9, weight: 238.03, desc: 'The heaviest naturally occurring element, used in nuclear energy.' },
];
