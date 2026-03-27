import {
  DocumentData,
  FieldValue,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";

export interface Heist {
  id: string;
  createdAt: Date;
  title: string;
  description: string;
  createdBy: string;
  createdByCodename: string;
  assignedTo: string;
  assignedToCodename: string;
  deadline: Date;
  finalStatus: null | "success" | "failure";
}

export interface CreateHeistInput {
  createdAt: FieldValue;
  title: string;
  description: string;
  createdBy: string;
  createdByCodename: string;
  assignedTo: string;
  assignedToCodename: string;
  deadline: Timestamp;
  finalStatus: null;
}

export interface UpdateHeistInput {
  title?: string;
  description?: string;
  assignedTo?: string;
  assignedToCodename?: string;
  deadline?: Timestamp;
  finalStatus?: null | "success" | "failure";
}

export const heistConverter = {
  toFirestore: (data: Partial<Heist>): DocumentData => data,

  fromFirestore: (snapshot: QueryDocumentSnapshot): Heist =>
    ({
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate(),
      deadline: snapshot.data().deadline?.toDate(),
    }) as Heist,
};
