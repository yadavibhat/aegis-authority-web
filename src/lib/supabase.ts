// Mock Database Store
const mockDb: any = {
    alerts: [
        { id: '1', tourist_id: '101', status: 'OPEN', type: 'Critical SOS', latitude: 28.5234, longitude: 77.1232, created_at: '2026-04-25T14:42:10Z' },
        { id: '2', tourist_id: '102', status: 'OPEN', type: 'Zone Breach', zone_id: 'z1', created_at: '2026-04-25T14:38:55Z' },
        { id: '3', tourist_id: '103', status: 'RESOLVED', type: 'Health Warning', created_at: '2026-04-25T14:35:12Z' },
    ],
    tourists: [
        { id: '101', name: 'M. CHAUHAN', aadhaar: '123456788821', phone: '9876543210', active: true },
        { id: '102', name: 'J. DOE', aadhaar: '876543219021', phone: '9876543222', active: true },
        { id: '103', name: 'K. SHARMA', aadhaar: '111122221109', phone: '9876543333', active: true },
        { id: '104', name: 'R. SINGH', aadhaar: '111122224421', phone: '9876543444', active: true },
    ],
    zones: [
        { id: 'z1', name: 'RED-FORBIDDEN', active: true },
        { id: 'z2', name: 'SECURE SECTOR 4', active: true },
    ],
    locations: [
        { id: 'l1', tourist_id: '101', lat: 28.5234, lng: 77.1232, created_at: '2026-04-25T14:40:00Z' },
    ],
    devices: [
        { device_id: 'W-92', tourist_id: '104', battery: 15, status: 'Active' }
    ]
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
