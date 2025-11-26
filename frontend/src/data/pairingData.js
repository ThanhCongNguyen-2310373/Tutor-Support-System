// src/data/pairingData.js

export const pairingData = [
  {
    id: 'P001',
    tutor: {
      name: 'Nguyễn Văn A',
      id: 'T001',
      slots: '3/5',
      schedule: 'T2, T4, T6',
      rating: 4.7
    },
    student: {
      name: 'Trần Thị B',
      id: 'S001',
      class: 'CC01',
      schedule: 'T2, T4, T6'
    },
    status: 'active',
    createdDate: '2025-10-20'
  },
  {
    id: 'P002',
    tutor: {
      name: 'Lê Văn C',
      id: 'T002',
      slots: '5/5',
      schedule: 'T3, T5, T7',
      rating: 4.9
    },
    student: {
      name: 'Phạm Văn D',
      id: 'S002',
      class: 'CC02',
      schedule: 'T3, T5, T7'
    },
    status: 'active',
    createdDate: '2025-10-19'
  },
  {
    id: 'P003',
    tutor: {
      name: 'Hoàng Thị E',
      id: 'T003',
      slots: '2/5',
      schedule: 'T2, T4',
      rating: 4.7
    },
    student: {
      name: 'Đỗ Văn F',
      id: 'S003',
      class: 'CC01',
      schedule: 'T2, T4'
    },
    status: 'active',
    createdDate: '2025-10-18'
  },
  {
    id: 'P004',
    tutor: {
      name: 'Trương Văn G',
      id: 'T004',
      slots: '4/5',
      schedule: 'T3, T5, T6, T7',
      rating: 4.6
    },
    student: {
      name: 'Vũ Thị H',
      id: 'S004',
      class: 'CC03',
      schedule: 'T3, T5, T6, T7'
    },
    status: 'pending',
    createdDate: '2025-10-17'
  }
];

export const availableTutors = [
  {
    id: 'T005',
    name: 'Ngô Văn I',
    slots: '1/5',
    schedule: 'T2, T4, T6',
    rating: 4.8
  },
  {
    id: 'T006',
    name: 'Bùi Thị K',
    slots: '0/5',
    schedule: 'T3, T5',
    rating: 4.9
  },
  {
    id: 'T003',
    name: 'Hoàng Thị E',
    slots: '2/5',
    schedule: 'T2, T4',
    rating: 4.7
  }
];

export const availableStudents = [
  {
    id: 'S005',
    name: 'Lý Văn L',
    class: 'CC02',
    schedule: 'T2, T4, T6'
  },
  {
    id: 'S006',
    name: 'Đinh Thị M',
    class: 'CC01',
    schedule: 'T3, T5, T7'
  }
];

export const pairingStats = {
  total: 124,
  active: 118,
  pending: 4,
  needsReview: 2
};