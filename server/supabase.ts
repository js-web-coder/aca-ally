import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// Create a single supabase client for the server
export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth related functions
export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
}

// Profile related functions
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
}

export async function updateProfile(
  userId: string, 
  profileData: { 
    display_name?: string;
    profile_image?: string;
    subject?: string;
    school?: string;
    educational_level?: string;
    role?: string;
    age?: number;
    class?: string;
    bio?: string;
  }
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('user_id', userId)
    .select()
    .single();
  
  return { data, error };
}

// Storage - for profile images
export async function uploadProfileImage(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase
    .storage
    .from('profile-images')
    .upload(fileName, file);
  
  if (error) return { path: null, error };
  
  const { data: publicURL } = supabase
    .storage
    .from('profile-images')
    .getPublicUrl(fileName);
  
  return { path: publicURL.publicUrl, error: null };
}

// Posts related functions
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*, user:users(username, profiles(display_name, profile_image))')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function getPostById(postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, user:users(username, profiles(display_name, profile_image))')
    .eq('id', postId)
    .single();
  
  return { data, error };
}

export async function createPost(
  userId: string, 
  postData: { 
    title: string; 
    content: string; 
    visibility: string; 
    subject?: string; 
  }
) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      ...postData
    })
    .select()
    .single();
  
  return { data, error };
}

export async function updatePost(postId: string, updates: any) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();
  
  return { data, error };
}

export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);
  
  return { error };
}

// Likes related functions
export async function toggleLike(userId: string, postId: string) {
  // First check if like exists
  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single();
  
  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);
    
    return { liked: false, error };
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert({ user_id: userId, post_id: postId });
    
    return { liked: true, error };
  }
}
