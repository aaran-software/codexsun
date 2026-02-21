// resources/js/types/web.d.ts

export interface Message {
    greetings: string;
    date: string;
}

// Use `type` instead of `interface`
export type HomePageProps = {
    message?: Message;
};
