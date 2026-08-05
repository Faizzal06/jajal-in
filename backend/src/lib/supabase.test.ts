import { supabase } from './supabase';

describe('Supabase Client', () => {
  it('should be initialized and have auth method', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });
});
