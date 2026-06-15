import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  MyGoals: undefined;
  CreateGoal: undefined;
  Friends: undefined;
  FriendProfile: { friendId: string };
  HistoryStats: undefined;
};

export type CameraStackParamList = {
  CameraGoals: undefined;
  CheckIn: { goalId: string };
  CheckInResult: {
    aiConfidence: number;
    aiFeedback: string;
    aiResult: 'approved' | 'warning' | 'rejected';
    checkInId?: string;
    goalId: string;
  };
};

export type RootTabParamList = {
  Feed: undefined;
  Camera: NavigatorScreenParams<CameraStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
