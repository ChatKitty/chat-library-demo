import React from "react";
import ChatKitty, { Message, TextUserMessage } from "chatkitty";
import {
  useChannels,
  useGuestSession,
  useChatContext,
  useCurrentUser,
  useCreateChannel,
  useMessages,
  ChatKittyProvider,
  Spinner,
  ChatContainer,
  ChatSession,
  ChannelHeader,
  MessageList,
  TextMessage,
  MessageInput,
} from "chatkitty-react-component-library";

// @ts-ignore
const client = ChatKitty.getInstance(process.env.REACT_APP_API_KEY);
const username = "guest";

const App = () => {
  const { isLoading } = useGuestSession(client, username);

  return (
    <div style={{ height: 600, width: 450 }}>
      {isLoading ? <Spinner /> : <ChatResources />}
    </div>
  );
};

const ChatResources = () => {
  const {
    isLoading: channelsLoading,
    resource: channels,
    makeRequest: fetchChannels,
  } = useChannels(client);
  const { makeRequest: createChannel } = useCreateChannel(client);

  React.useEffect(() => {
    const getOrCreateChannel = async () => {
      await createChannel({
        type: "PUBLIC",
        name: "Demo Channel",
        members: [{ username }],
      });
      await fetchChannels();
    };
    if (!channelsLoading && channels?.length === 0) {
      getOrCreateChannel();
    }
  }, [channels]);

  if (!channels || channels.length === 0) {
    return <Spinner />;
  }

  return (
    <ChatKittyProvider client={client} channels={channels}>
      <Chat />
    </ChatKittyProvider>
  );
};

const Chat = () => {
  const { client, channel } = useChatContext();

  if (!client || !channel) {
    throw new Error("Invalid component context");
  }

  const { resource: currentUser } = useCurrentUser(client);

  const { resource: messages, setResource: setMessages } = useMessages(
    client,
    channel
  );

  if (!messages || !currentUser) {
    return <Spinner />;
  }

  const onReceivedMessage = (message: Message) => {
    setMessages((prev) => [message, ...(prev || [])]);
  };

  return (
    <ChatContainer>
      <ChatSession onReceivedMessage={onReceivedMessage}>
        <ChannelHeader
          name={channel.name}
          description={(channel.properties as any).description}
        />
        <MessageList>
          {messages.map((message) => {
            const casted = message as TextUserMessage;
            return (
              <TextMessage
                key={casted.id}
                displayPictureUrl={casted.user.displayPictureUrl}
                displayName={casted.user.displayName}
                createdTime={new Date(casted.createdTime)}
                body={casted.body}
              />
            );
          })}
        </MessageList>
        <MessageInput />
      </ChatSession>
    </ChatContainer>
  );
};

export default App;
