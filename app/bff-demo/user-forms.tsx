"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { User } from "@/lib/types/user";
import type {
  UserActionResult,
  createUserAction,
  updateUserAction,
  deleteUserAction,
} from "@/lib/actions/user-actions";

type CreateAction = typeof createUserAction;
type UpdateAction = typeof updateUserAction;
type DeleteAction = typeof deleteUserAction;

interface SubmitButtonProps {
  children: string;
  pendingText: string;
  className?: string;
}

const SubmitButton = ({
  children,
  pendingText,
  className,
}: SubmitButtonProps) => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      aria-busy={pending}
    >
      {pending ? pendingText : children}
    </button>
  );
};

interface FeedbackProps {
  state: UserActionResult;
}

const Feedback = ({ state }: FeedbackProps) => {
  if (!state.message) return null;
  const baseStyle =
    "mt-2 text-sm px-3 py-2 rounded border transition-colors duration-150";
  return (
    <p
      className={
        state.ok
          ? `${baseStyle} bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800`
          : `${baseStyle} bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800`
      }
    >
      {state.message}
    </p>
  );
};

interface CreateUserFormProps {
  action: CreateAction;
}

export const CreateUserForm = ({ action }: CreateUserFormProps) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction] = useActionState<UserActionResult, FormData>(
    action,
    { ok: true }
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-1">
          이름
        </label>
        <input
          name="name"
          type="text"
          required
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-1">
          이메일
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-1">
          역할
        </label>
        <select
          name="role"
          defaultValue="user"
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
        >
          <option value="user">사용자</option>
          <option value="admin">관리자</option>
          <option value="guest">게스트</option>
        </select>
      </div>
      <SubmitButton
        pendingText="생성 중..."
        className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 font-medium"
      >
        생성
      </SubmitButton>
      <Feedback state={state} />
    </form>
  );
};

interface EditUserFormProps {
  action: UpdateAction;
  user: User | null;
}

export const EditUserForm = ({ action, user }: EditUserFormProps) => {
  const [state, formAction] = useActionState<UserActionResult, FormData>(
    action,
    { ok: true }
  );

  const defaultRole = useMemo(() => user?.role ?? "user", [user?.role]);

  if (!user) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        수정할 사용자를 선택하세요.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={user.id} />
      <div>
        <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-1">
          이름
        </label>
        <input
          name="name"
          type="text"
          defaultValue={user.name}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-1">
          이메일
        </label>
        <input
          name="email"
          type="email"
          defaultValue={user.email}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-1">
          역할
        </label>
        <select
          name="role"
          defaultValue={defaultRole}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
        >
          <option value="user">사용자</option>
          <option value="admin">관리자</option>
          <option value="guest">게스트</option>
        </select>
      </div>
      <SubmitButton
        pendingText="수정 중..."
        className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 font-medium"
      >
        수정
      </SubmitButton>
      <Feedback state={state} />
    </form>
  );
};

interface DeleteUserFormProps {
  action: DeleteAction;
  userId: string;
}

export const DeleteUserForm = ({ action, userId }: DeleteUserFormProps) => {
  const [state, formAction] = useActionState<UserActionResult, FormData>(
    action,
    { ok: true }
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={userId} />
      <SubmitButton
        pendingText="삭제 중..."
        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        삭제
      </SubmitButton>
      {!state.ok && state.message ? (
        <span className="text-xs text-red-600 dark:text-red-400">
          {state.message}
        </span>
      ) : null}
    </form>
  );
};
