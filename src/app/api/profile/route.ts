// API route for user profile management
import { NextRequest, NextResponse } from 'next/server';

// Mock database
let users = [
  {
    id: 1,
    name: 'Budi Santoso',
    email: 'budi.santoso@example.com',
    phone: '+62 812 3456 7890',
    address: 'Jl. Mawar No. 12, Jakarta Selatan',
    totalPoints: 1500,
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would extract user ID from auth token
    const userId = 1; // Mock user ID
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = 1; // Mock user ID
    const { name, email, phone, address } = await request.json();
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update user
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      phone: phone || users[userIndex].phone,
      address: address || users[userIndex].address,
    };
    
    return NextResponse.json(users[userIndex]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}