import intl from 'react-intl-universal';

export type FilesResult = {
    kf_id: string;
    name: string;
    domain: string;
    score: string;
    code: string;
    family_count: string;
    file_count: string;
  };

export const filesColumns = [
  {
    title: intl.get('screen.patient.details.file.name'),
    name: 'title',
  },
  {
    title: intl.get('screen.patient.details.file.type'),
    name: 'type',
  },
  {
    title: intl.get('screen.patient.details.file.format'),
    name: 'format',
  },
  {
    title: intl.get('screen.patient.details.file.size'),
    name: 'size',
  },
  {
    title: intl.get('screen.patient.details.file.sample'),
    name: 'sample',
  },
  {
    title: intl.get('screen.patient.details.file.aliquot'),
    name: 'aliquot',
  },
  {
    title: intl.get('screen.patient.details.file.prescription'),
    name: 'prescription',
    sorter: (a: any, b: any) => parseInt(a.prescription.props.children, 10) - parseInt(b.prescription.props.children, 10),
  },
  {
    title: intl.get('screen.patient.details.file.date'),
    name: 'date',
    sorter: (a: { date: string; }, b: { date: string; }) => {
      const dateA: Date = new Date(a.date.replace(/-/g, '/'));
      const dateB: Date = new Date(b.date.replace(/-/g, '/'));
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    title: intl.get('screen.patient.details.file.action'),
    name: 'action',
  },
].map((c) => ({ ...c, key: c.name, dataIndex: c.name }));
