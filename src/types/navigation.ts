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
};

export type CameraStackParamList = {
  CameraGoals: undefined;
  CheckIn: { goalId: string };
  CheckInResult: { checkInId: string };
};

export type RootTabParamList = {
  Feed: undefined;
  Camera: NavigatorScreenParams<CameraStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
