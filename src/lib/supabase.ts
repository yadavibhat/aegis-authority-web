// Mock Database Store
const mockDb: any = {
    alerts: [],
    tourists: [],
    zones: [],
    locations: [],
    devices: []
};

// Simulated Supabase Client
export const supabase = {
    from: (table: string) => {
        return {
            select: (query: string = '*') => {
                let result = mockDb[table] || [];
                
                // Very basic mock join logic for '*, tourist:tourists(*)'
                if (query.includes('tourist:tourists')) {
                    result = result.map((item: any) => ({
                        ...item,
                        tourist: mockDb.tourists.find((t: any) => t.id === item.tourist_id)
                    }));
                }

                // Mock chainers
                const chain = {
                    limit: (num: number) => {
                        result = result.slice(0, num);
                        return chain;
                    },
                    order: () => chain,
                    eq: (field: string, value: any) => {
                        result = result.filter((item: any) => item[field] === value);
                        return chain;
                    },
                    ilike: (field: string, value: string) => {
                        const val = value.replace(/%/g, '').toLowerCase();
                        result = result.filter((item: any) => String(item[field]).toLowerCase().includes(val));
                        return chain;
                    },
                    single: () => {
                        // Return the first object instead of array
                        return Promise.resolve({ data: result[0], error: null }) as any;
                    },
                    then: (resolve: any) => resolve({ data: result, error: null }) // allows await to work directly
                };
                
                // Allow direct awaiting
                const promise = Promise.resolve({ data: result, error: null });
                Object.assign(promise, chain);
                return promise as any;
            },
            insert: (body: any) => {
                const newItem = { id: Math.random().toString(), ...body, created_at: new Date().toISOString() };
                if (mockDb[table]) {
                    mockDb[table].push(newItem);
                }
                const chain: any = {
                    select: () => Promise.resolve({ data: [newItem], error: null }) as any
                };
                return chain as any;
            },
            update: (body: any) => {
                let updatedItems: any[] = [];
                const chain: any = {
                    eq: (field: string, value: any) => {
                        if (mockDb[table]) {
                            mockDb[table] = mockDb[table].map((item: any) => {
                                if (item[field] === String(value)) {
                                    const updated = { ...item, ...body };
                                    updatedItems.push(updated);
                                    return updated;
                                }
                                return item;
                            });
                        }
                        return chain;
                    },
                    select: () => Promise.resolve({ data: updatedItems, error: null })
                };
                return chain;
            }
        };
    }
};
