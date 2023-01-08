import { AppealMessage } from './AppealMessage';

export interface AppealItem {
    id: number,
    title: string,
    messages: AppealMessage[]
}