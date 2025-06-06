'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserPlus, Calendar, Search } from 'lucide-react';
import type { ClientListItem, ClientStatus } from '@/lib/types/client';
import { calculateAge, formatPhoneNumber } from '@/lib/types/client';
import { ClientTable } from '@/components/client-table';
import { ClientDrawer } from '@/components/client-drawer';
import { OutcomesModal } from '@/components/outcomes-modal';
import type { SortingState } from '@tanstack/react-table';

// Mock client data - in a real app, this would come from the database
const mockClientData: ClientListItem[] = [
  {
    id: '1',
    createdAt: new Date('2023-01-15'),
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1985-06-15'),
    gender: 'Male',
    contactPhone: '5551234567',
    contactEmail: 'john.doe@email.com',
    address: '123 Main St, Springfield, IL 62701',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-10'),
    nextAppointment: new Date('2024-01-25'),
    insurance: {
      provider: 'Blue Cross Blue Shield',
      memberId: 'BC123456789',
      groupNumber: 'GRP001',
      coverageType: 'PPO',
    },
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    mrn: 'MRN001234',
    age: calculateAge(new Date('1985-06-15')),
    outcomes: {
      phq9: [
        { date: new Date('2024-10-15'), score: 22 },
        { date: new Date('2024-10-29'), score: 19 },
        { date: new Date('2024-11-12'), score: 16 },
        { date: new Date('2024-11-26'), score: 12 },
        { date: new Date('2024-12-10'), score: 9 },
        { date: new Date('2025-01-07'), score: 6 },
      ],
    },
  },
  {
    id: '2',
    createdAt: new Date('2023-02-20'),
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: new Date('1990-03-22'),
    gender: 'Female',
    contactPhone: '5559876543',
    contactEmail: 'jane.smith@email.com',
    address: '456 Oak Ave, Springfield, IL 62702',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-12'),
    nextAppointment: undefined,
    insurance: {
      provider: 'Aetna',
      memberId: 'AET987654321',
      groupNumber: 'GRP002',
      coverageType: 'HMO',
    },
    conditions: ['Asthma', 'Anxiety'],
    mrn: 'MRN001235',
    age: calculateAge(new Date('1990-03-22')),
  },
  {
    id: '3',
    createdAt: new Date('2024-01-02'),
    firstName: 'Robert',
    lastName: 'Johnson',
    dateOfBirth: new Date('1975-11-08'),
    gender: 'Male',
    contactPhone: '5552468013',
    contactEmail: 'robert.j@email.com',
    address: '789 Elm St, Springfield, IL 62703',
    photoUrl: null,
    status: 'new',
    lastVisit: undefined,
    nextAppointment: new Date('2024-01-20'),
    insurance: {
      provider: 'UnitedHealthcare',
      memberId: 'UHC456789012',
      groupNumber: 'GRP003',
      coverageType: 'PPO',
    },
    conditions: [],
    mrn: 'MRN001236',
    age: calculateAge(new Date('1975-11-08')),
  },
  {
    id: '4',
    createdAt: new Date('2023-03-10'),
    firstName: 'Emily',
    lastName: 'Davis',
    dateOfBirth: new Date('1988-09-30'),
    gender: 'Female',
    contactPhone: '5553691470',
    contactEmail: 'emily.davis@email.com',
    address: '321 Pine St, Springfield, IL 62704',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-08'),
    nextAppointment: new Date('2024-02-08'),
    insurance: {
      provider: 'Cigna',
      memberId: 'CIG789012345',
      groupNumber: 'GRP004',
      coverageType: 'PPO',
    },
    conditions: ['Migraine', 'GERD'],
    mrn: 'MRN001237',
    age: calculateAge(new Date('1988-09-30')),
  },
  {
    id: '5',
    createdAt: new Date('2023-04-15'),
    firstName: 'Michael',
    lastName: 'Brown',
    dateOfBirth: new Date('1970-12-05'),
    gender: 'Male',
    contactPhone: '5557418520',
    contactEmail: 'michael.brown@email.com',
    address: '654 Maple Dr, Springfield, IL 62705',
    photoUrl: null,
    status: 'inactive',
    lastVisit: new Date('2023-09-15'),
    nextAppointment: undefined,
    insurance: undefined,
    conditions: ['Hyperlipidemia'],
    mrn: 'MRN001238',
    age: calculateAge(new Date('1970-12-05')),
  },
  {
    id: '6',
    createdAt: new Date('2023-05-20'),
    firstName: 'Lisa',
    lastName: 'Anderson',
    dateOfBirth: new Date('1995-07-18'),
    gender: 'Female',
    contactPhone: '5558529630',
    contactEmail: 'lisa.anderson@email.com',
    address: '987 Birch Ln, Springfield, IL 62706',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-15'),
    nextAppointment: undefined,
    insurance: {
      provider: 'Humana',
      memberId: 'HUM234567890',
      groupNumber: 'GRP005',
      coverageType: 'HMO',
    },
    conditions: ['Depression'],
    mrn: 'MRN001239',
    age: calculateAge(new Date('1995-07-18')),
  },
  {
    id: '7',
    createdAt: new Date('2024-01-05'),
    firstName: 'David',
    lastName: 'Martinez',
    dateOfBirth: new Date('1982-04-12'),
    gender: 'Male',
    contactPhone: '5559637410',
    contactEmail: 'david.m@email.com',
    address: '159 Cedar St, Springfield, IL 62707',
    photoUrl: null,
    status: 'new',
    lastVisit: undefined,
    nextAppointment: new Date('2024-01-22'),
    insurance: {
      provider: 'Blue Cross Blue Shield',
      memberId: 'BC345678901',
      groupNumber: 'GRP001',
      coverageType: 'PPO',
    },
    conditions: [],
    mrn: 'MRN001240',
    age: calculateAge(new Date('1982-04-12')),
  },
  {
    id: '8',
    createdAt: new Date('2023-06-25'),
    firstName: 'Sarah',
    lastName: 'Wilson',
    dateOfBirth: new Date('1978-08-25'),
    gender: 'Female',
    contactPhone: '5551597530',
    contactEmail: 'sarah.wilson@email.com',
    address: '753 Walnut Ave, Springfield, IL 62708',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-11'),
    nextAppointment: new Date('2024-01-18'),
    insurance: {
      provider: 'Anthem',
      memberId: 'ANT567890123',
      groupNumber: 'GRP006',
      coverageType: 'EPO',
    },
    conditions: ['Arthritis', 'Hypothyroidism'],
    mrn: 'MRN001241',
    age: calculateAge(new Date('1978-08-25')),
  },
  {
    id: '9',
    createdAt: new Date('2023-07-30'),
    firstName: 'James',
    lastName: 'Taylor',
    dateOfBirth: new Date('1992-01-10'),
    gender: 'Male',
    contactPhone: '5557539510',
    contactEmail: 'james.taylor@email.com',
    address: '852 Spruce Rd, Springfield, IL 62709',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-14'),
    nextAppointment: undefined,
    insurance: {
      provider: 'Kaiser Permanente',
      memberId: 'KP890123456',
      groupNumber: 'GRP007',
      coverageType: 'HMO',
    },
    conditions: ['ADHD'],
    mrn: 'MRN001242',
    age: calculateAge(new Date('1992-01-10')),
  },
  {
    id: '10',
    createdAt: new Date('2023-08-05'),
    firstName: 'Patricia',
    lastName: 'Thomas',
    dateOfBirth: new Date('1965-05-28'),
    gender: 'Female',
    contactPhone: '5553578520',
    contactEmail: 'patricia.t@email.com',
    address: '951 Oak Park Dr, Springfield, IL 62710',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-13'),
    nextAppointment: new Date('2024-01-27'),
    insurance: {
      provider: 'Medicare',
      memberId: 'MED123456789',
      groupNumber: undefined,
      coverageType: 'Part B',
    },
    conditions: ['Osteoporosis', 'Hypertension', 'Diabetes'],
    mrn: 'MRN001243',
    age: calculateAge(new Date('1965-05-28')),
  },
  {
    id: '11',
    createdAt: new Date('2023-09-10'),
    firstName: 'Christopher',
    lastName: 'Garcia',
    dateOfBirth: new Date('1987-10-15'),
    gender: 'Male',
    contactPhone: '5558524560',
    contactEmail: 'chris.garcia@email.com',
    address: '147 Elm Grove, Springfield, IL 62711',
    photoUrl: null,
    status: 'inactive',
    lastVisit: new Date('2023-11-20'),
    nextAppointment: undefined,
    insurance: {
      provider: 'Aetna',
      memberId: 'AET234567891',
      groupNumber: 'GRP002',
      coverageType: 'PPO',
    },
    conditions: ['Sleep Apnea'],
    mrn: 'MRN001244',
    age: calculateAge(new Date('1987-10-15')),
  },
  {
    id: '12',
    createdAt: new Date('2024-01-08'),
    firstName: 'Nancy',
    lastName: 'Rodriguez',
    dateOfBirth: new Date('1993-02-20'),
    gender: 'Female',
    contactPhone: '5554567890',
    contactEmail: 'nancy.r@email.com',
    address: '258 Maple Grove, Springfield, IL 62712',
    photoUrl: null,
    status: 'new',
    lastVisit: undefined,
    nextAppointment: new Date('2024-01-19'),
    insurance: {
      provider: 'Cigna',
      memberId: 'CIG345678912',
      groupNumber: 'GRP004',
      coverageType: 'HMO',
    },
    conditions: [],
    mrn: 'MRN001245',
    age: calculateAge(new Date('1993-02-20')),
  },
  {
    id: '13',
    createdAt: new Date('2023-10-15'),
    firstName: 'Daniel',
    lastName: 'Lee',
    dateOfBirth: new Date('1980-06-08'),
    gender: 'Male',
    contactPhone: '5557891230',
    contactEmail: 'daniel.lee@email.com',
    address: '369 Pine Ridge, Springfield, IL 62713',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-09'),
    nextAppointment: undefined,
    insurance: {
      provider: 'UnitedHealthcare',
      memberId: 'UHC567891234',
      groupNumber: 'GRP003',
      coverageType: 'EPO',
    },
    conditions: ['Chronic Back Pain'],
    mrn: 'MRN001246',
    age: calculateAge(new Date('1980-06-08')),
  },
  {
    id: '14',
    createdAt: new Date('2023-11-20'),
    firstName: 'Karen',
    lastName: 'White',
    dateOfBirth: new Date('1972-09-14'),
    gender: 'Female',
    contactPhone: '5551234560',
    contactEmail: 'karen.white@email.com',
    address: '741 Cedar Hill, Springfield, IL 62714',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-15'),
    nextAppointment: new Date('2024-01-29'),
    insurance: {
      provider: 'Anthem',
      memberId: 'ANT678912345',
      groupNumber: 'GRP006',
      coverageType: 'PPO',
    },
    conditions: ['Fibromyalgia', 'IBS'],
    mrn: 'MRN001247',
    age: calculateAge(new Date('1972-09-14')),
  },
  {
    id: '15',
    createdAt: new Date('2023-12-01'),
    firstName: 'Kevin',
    lastName: 'Harris',
    dateOfBirth: new Date('1998-11-22'),
    gender: 'Male',
    contactPhone: '5559876540',
    contactEmail: 'kevin.h@email.com',
    address: '852 Birch Ave, Springfield, IL 62715',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-12'),
    nextAppointment: undefined,
    insurance: undefined,
    conditions: ['Seasonal Allergies'],
    mrn: 'MRN001248',
    age: calculateAge(new Date('1998-11-22')),
  },
  {
    id: '16',
    createdAt: new Date('2024-01-10'),
    firstName: 'Betty',
    lastName: 'Clark',
    dateOfBirth: new Date('1960-03-30'),
    gender: 'Female',
    contactPhone: '5556547890',
    contactEmail: 'betty.clark@email.com',
    address: '963 Oak Lane, Springfield, IL 62716',
    photoUrl: null,
    status: 'new',
    lastVisit: undefined,
    nextAppointment: new Date('2024-01-21'),
    insurance: {
      provider: 'Medicare',
      memberId: 'MED987654321',
      groupNumber: undefined,
      coverageType: 'Part A & B',
    },
    conditions: [],
    mrn: 'MRN001249',
    age: calculateAge(new Date('1960-03-30')),
  },
  {
    id: '17',
    createdAt: new Date('2023-12-15'),
    firstName: 'William',
    lastName: 'Lewis',
    dateOfBirth: new Date('1985-07-05'),
    gender: 'Male',
    contactPhone: '5553217890',
    contactEmail: 'william.lewis@email.com',
    address: '159 Spruce St, Springfield, IL 62717',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-14'),
    nextAppointment: new Date('2024-01-28'),
    insurance: {
      provider: 'Blue Cross Blue Shield',
      memberId: 'BC789123456',
      groupNumber: 'GRP001',
      coverageType: 'HMO',
    },
    conditions: ['Psoriasis', 'Anxiety'],
    mrn: 'MRN001250',
    age: calculateAge(new Date('1985-07-05')),
  },
  {
    id: '18',
    createdAt: new Date('2023-08-20'),
    firstName: 'Sandra',
    lastName: 'Walker',
    dateOfBirth: new Date('1976-12-18'),
    gender: 'Female',
    contactPhone: '5557894560',
    contactEmail: 'sandra.w@email.com',
    address: '753 Elm Park, Springfield, IL 62718',
    photoUrl: null,
    status: 'inactive',
    lastVisit: new Date('2023-10-10'),
    nextAppointment: undefined,
    insurance: {
      provider: 'Humana',
      memberId: 'HUM456789123',
      groupNumber: 'GRP005',
      coverageType: 'PPO',
    },
    conditions: ['Lupus'],
    mrn: 'MRN001251',
    age: calculateAge(new Date('1976-12-18')),
  },
  {
    id: '19',
    createdAt: new Date('2024-01-12'),
    firstName: 'George',
    lastName: 'Hall',
    dateOfBirth: new Date('1991-04-25'),
    gender: 'Male',
    contactPhone: '5554561230',
    contactEmail: 'george.hall@email.com',
    address: '852 Pine View, Springfield, IL 62719',
    photoUrl: null,
    status: 'new',
    lastVisit: undefined,
    nextAppointment: new Date('2024-01-23'),
    insurance: {
      provider: 'Kaiser Permanente',
      memberId: 'KP123789456',
      groupNumber: 'GRP007',
      coverageType: 'HMO',
    },
    conditions: [],
    mrn: 'MRN001252',
    age: calculateAge(new Date('1991-04-25')),
  },
  {
    id: '20',
    createdAt: new Date('2023-09-25'),
    firstName: 'Maria',
    lastName: 'Young',
    dateOfBirth: new Date('1983-08-10'),
    gender: 'Female',
    contactPhone: '5551237890',
    contactEmail: 'maria.young@email.com',
    address: '963 Cedar Ave, Springfield, IL 62720',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-15'),
    nextAppointment: undefined,
    insurance: {
      provider: 'Aetna',
      memberId: 'AET789456123',
      groupNumber: 'GRP002',
      coverageType: 'EPO',
    },
    conditions: ['Endometriosis', 'Anemia'],
    mrn: 'MRN001253',
    age: calculateAge(new Date('1983-08-10')),
  },
  {
    id: '21',
    createdAt: new Date('2023-10-30'),
    firstName: 'Thomas',
    lastName: 'King',
    dateOfBirth: new Date('1969-01-16'),
    gender: 'Male',
    contactPhone: '5557893210',
    contactEmail: 'thomas.king@email.com',
    address: '147 Birch Hill, Springfield, IL 62721',
    photoUrl: null,
    status: 'active',
    lastVisit: new Date('2024-01-10'),
    nextAppointment: new Date('2024-02-10'),
    insurance: {
      provider: 'Cigna',
      memberId: 'CIG891234567',
      groupNumber: 'GRP004',
      coverageType: 'PPO',
    },
    conditions: ['COPD', 'Hypertension'],
    mrn: 'MRN001254',
    age: calculateAge(new Date('1969-01-16')),
  },
];

export default function ClientsPage() {
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedClient, setSelectedClient] = useState<ClientListItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [outcomesModalOpen, setOutcomesModalOpen] = useState(false);
  
  // Handle viewing a client
  const handleViewClient = (client: ClientListItem) => {
    setSelectedClient(client);
    setDrawerOpen(true);
  };
  
  // Handle viewing outcomes
  const handleViewOutcomes = (client: ClientListItem) => {
    setSelectedClient(client);
    setOutcomesModalOpen(true);
  };
  
  // Filter data based on search query and status
  const filteredData = useMemo(() => {
    let data = mockClientData;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      data = data.filter(client => client.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(client => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        const phone = client.contactPhone || '';
        const email = client.contactEmail?.toLowerCase() || '';
        const mrn = client.mrn.toLowerCase();
        
        return (
          fullName.includes(query) ||
          phone.includes(query) ||
          email.includes(query) ||
          mrn.includes(query)
        );
      });
    }
    
    return data;
  }, [searchQuery, statusFilter]);
  
  // Calculate statistics from filtered data
  const totalPatients = filteredData.length;
  const activePatients = filteredData.filter(c => c.status === 'active').length;
  const newPatientsThisMonth = filteredData.filter(c => c.status === 'new').length;
  const patientsSeenToday = filteredData.filter(c => 
    c.lastVisit && c.lastVisit.toDateString() === new Date().toDateString()
  ).length;
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground">
          Manage your patients and their information
        </p>
      </div>
      
      {/* Summary Cards Section */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{totalPatients}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{activePatients}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{newPatientsThisMonth}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Seen Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{patientsSeenToday}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and Search Section */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email, or MRN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({mockClientData.length})
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            Active ({mockClientData.filter(c => c.status === 'active').length})
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive ({mockClientData.filter(c => c.status === 'inactive').length})
          </Button>
          <Button
            variant={statusFilter === 'new' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('new')}
          >
            New ({mockClientData.filter(c => c.status === 'new').length})
          </Button>
        </div>
      </div>
      
      {/* Data Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? 'No clients found matching your search.' : 'No clients found.'}
              </p>
            </div>
          ) : (
            <ClientTable 
              data={filteredData} 
              sorting={sorting}
              setSorting={setSorting}
              onViewClient={handleViewClient}
              onViewOutcomes={handleViewOutcomes}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Client Drawer */}
      <ClientDrawer
        client={selectedClient}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
      
      {/* Outcomes Modal */}
      <OutcomesModal
        client={selectedClient}
        open={outcomesModalOpen}
        onOpenChange={setOutcomesModalOpen}
      />
    </div>
  );
}
