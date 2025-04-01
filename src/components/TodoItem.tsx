import React, { Dispatch, SetStateAction, useState } from 'react';
import { Todo } from '../types/Todo';
import classNames from 'classnames';
import { TodoLoader } from './TodoLoader';
import * as todosService from '../api/todos';

interface TodoIt {
  tempTodo: Todo;
  isTempTodo: boolean;
  controlChecked: number[];
  setControlChecked: Dispatch<SetStateAction<number[]>>;
  setTodoItem: Dispatch<SetStateAction<Todo[]>>;
  handleTodoDelete: (usersId: number) => void;
  arrTodos: number[];
  delLoader: number | null;
  toggleAllTodos: () => void;
  loaderApi: boolean;
  updatedPost: (updatedPosts: Todo) => void;
}

export const TodoItem: React.FC<TodoIt> = ({
  tempTodo,
  isTempTodo,
  // setControlChecked,
  setTodoItem,
  handleTodoDelete,
  arrTodos,
  delLoader,
  // toggleAllTodos,
  loaderApi,
  updatedPost,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tempTodo.title);
  const [loader, setLoader] = useState(false);

  const toggleTodo = (id: number) => {
    const todoToUpdate = { ...tempTodo, completed: !tempTodo.completed };

    setLoader(true);

    todosService
      .updatePost(todoToUpdate)
      .then(() => {
        // Оновлюємо список тудушок тільки після успішного запиту
        setTodoItem(prevItems =>
          prevItems.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        );
      })
      .finally(() => {
        setLoader(false);
      });
  };

  const isLoading = arrTodos.includes(tempTodo.id) || delLoader === tempTodo.id;

  const handleEditSubmit = () => {
    if (!editValue.trim()) {
      handleTodoDelete(tempTodo.id);

      return;
    }

    const updatedTodo = { ...tempTodo, title: editValue.trim() };

    // Увімкнення лоадера
    setLoader(true);

    todosService
      .updatePost(updatedTodo)
      .then(() => {
        setTodoItem(prevItems =>
          prevItems.map(todo => (todo.id === tempTodo.id ? updatedTodo : todo)),
        );
      })
      .finally(() => {
        setIsEditing(false);
        setLoader(false);
      });
  };

  return (
    <div>
      <div
        data-cy="Todo"
        key={tempTodo.id}
        className={classNames('todo', {
          completed: tempTodo.completed,
        })}
      >
        <label
          className="todo__status-label"
          aria-label="Toggle status"
          onClick={() => {
            const updatedTodo = { ...tempTodo, completed: !tempTodo.completed };

            toggleTodo(tempTodo.id);
            // toggleAllTodos();
            updatedPost(updatedTodo);
          }}
        >
          <input
            data-cy="TodoStatus"
            type="checkbox"
            className="todo__status"
            checked={tempTodo.completed}
            readOnly
          />
        </label>

        {isEditing ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              handleEditSubmit();
            }}
          >
            <input
              data-cy="TodoTitleField"
              type="text"
              className="todo__title-field"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditValue(tempTodo.title);
                }
              }}
              autoFocus
            />
          </form>
        ) : (
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => setIsEditing(true)}
          >
            {tempTodo.title}
          </span>
        )}

        {!isEditing && (
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => handleTodoDelete(tempTodo.id)}
          >
            ×
          </button>
        )}

        <TodoLoader
          isActive={
            isLoading ||
            delLoader === tempTodo.id ||
            loader ||
            isTempTodo ||
            loaderApi
          }
        />
      </div>
    </div>
  );
};
