// API route for point exchanges (tukar)
import { NextRequest, NextResponse } from 'next/server';

// Define TypeScript interfaces
interface User {
  id: number;
  name: string;
  points: number;
}

interface ExchangeItem {
  id: number;
  name: string;
  description: string;
  points: number;
  image: string;
  category: string;
  stock: number;
}

interface Exchange {
  id: number;
  userId: number;
  itemId: number;
  date: string;
  pointsUsed: number;
  status: string;
}

// Mock database for users and their points
let users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    points: 100, // Initial points for testing
  },
  {
    id: 2,
    name: 'Jane Smith',
    points: 80, // Initial points for testing
  }
];

// Mock database for exchange items
const exchangeItems: ExchangeItem[] = [
  {
    id: 1,
    name: 'Sabun Cuci',
    description: 'Sabun cuci piring berkualitas tinggi',
    points: 200,
    image: '/images/sabun-cuci.jpg', // Use local images for better performance
    category: 'Kebersihan',
    stock: 50
  },
  {
    id: 2,
    name: 'Shampoo',
    description: 'Shampoo herbal untuk perawatan rambut',
    points: 300,
    image: '/images/shampoo.jpg',
    category: 'Perawatan',
    stock: 30
  },
  {
    id: 3,
    name: 'Bensin Bio',
    description: 'Bensin ramah lingkungan dari minyak jelantah',
    points: 500,
    image: '/images/bensin-bio.jpg',
    category: 'Bahan Bakar',
    stock: 20
  },
  {
    id: 4,
    name: 'Pupuk Organik',
    description: 'Pupuk organik alami untuk tanaman',
    points: 150,
    image: '/images/pupuk-organik.jpg',
    category: 'Pertanian',
    stock: 100
  },
  {
    id: 5,
    name: 'Pensil Kayu',
    description: 'Pensil dari kayu daur ulang',
    points: 100,
    image: '/images/pensil-kayu.jpg',
    category: 'Alat Tulis',
    stock: 75
  },
  {
    id: 6,
    name: 'Tas Belanja',
    description: 'Tas belanja dari bahan daur ulang',
    points: 400,
    image: '/images/tas-belanja.jpg',
    category: 'Aksesori',
    stock: 40
  }
];

// Mock database for exchange transactions
let exchanges: Exchange[] = [
  {
    id: 1,
    userId: 1,
    itemId: 2,
    date: '2023-10-20',
    pointsUsed: 300,
    status: 'completed'
  },
  {
    id: 2,
    userId: 1,
    itemId: 5,
    date: '2023-11-05',
    pointsUsed: 200,
    status: 'completed'
  }
];

// Helper function to sanitize strings
function sanitizeString(input: string): string {
  return input.replace(/[<>]/g, '');
}

// Helper function to validate IDs (prevent injection attacks)
function isValidId(id: number): boolean {
  return Number.isInteger(id) && id > 0 && id <= 1000000; // Reasonable upper limit
}

// GET route to fetch exchange items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    let category = searchParams.get('category');

    if (userId) {
      // If userId is provided, return user's exchange history
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum) || !isValidId(userIdNum)) {
        return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
      }

      const userExchanges = exchanges.filter(exchange => exchange.userId === userIdNum);

      // Add item details to each exchange
      const exchangesWithItems = userExchanges.map(ex => {
        const item = exchangeItems.find(i => i.id === ex.itemId);
        return {
          ...ex,
          item
        };
      });

      return NextResponse.json(exchangesWithItems);
    } else {
      // Otherwise return available exchange items, optionally filtered by category
      let filteredItems = [...exchangeItems]; // Create a copy to avoid modifying original

      if (category) {
        category = sanitizeString(category); // Sanitize category input
        filteredItems = exchangeItems.filter(item =>
          item.category.toLowerCase().includes(category!.toLowerCase())
        );
      }

      // Return items with updated stock info
      return NextResponse.json(filteredItems);
    }
  } catch (error) {
    console.error('Error fetching exchange data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST route to create a new exchange
export async function POST(request: NextRequest) {
  try {
    const { userId, itemId } = await request.json();

    // Validation
    if (!userId || !itemId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, itemId' },
        { status: 400 }
      );
    }

    // Validate userId and itemId are valid numbers
    const userIdNum = parseInt(userId);
    const itemIdNum = parseInt(itemId);

    if (isNaN(userIdNum) || isNaN(itemIdNum)) {
      return NextResponse.json(
        { error: 'userId and itemId must be valid numbers' },
        { status: 400 }
      );
    }

    // Additional validation to prevent injection attacks
    if (!isValidId(userIdNum) || !isValidId(itemIdNum)) {
      return NextResponse.json(
        { error: 'Invalid userId or itemId' },
        { status: 400 }
      );
    }

    // Find the user
    const user = users.find(u => u.id === userIdNum);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the item
    const item = exchangeItems.find(i => i.id === itemIdNum);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Check if user has enough points
    if (user.points < item.points) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // Check if item is in stock
    if (item.stock <= 0) {
      return NextResponse.json({ error: 'Item out of stock' }, { status: 400 });
    }

    const newExchange: Exchange = {
      id: exchanges.length + 1,
      userId: userIdNum,
      itemId: itemIdNum,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      pointsUsed: item.points,
      status: 'completed'
    };

    // Add to exchanges array
    exchanges.push(newExchange);

    // Reduce user's points
    user.points -= item.points;

    // Reduce item stock
    const itemIndex = exchangeItems.findIndex(i => i.id === itemIdNum);
    if (itemIndex !== -1) {
      exchangeItems[itemIndex].stock -= 1;
    }

    return NextResponse.json(newExchange, { status: 201 });
  } catch (error) {
    console.error('Error creating exchange:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}