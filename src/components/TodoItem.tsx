import React, { Dispatch, SetStateAction, useState } from 'react';
import { Todo } from '../types/Todo';
import classNames from 'classnames';
import { TodoLoader } from './TodoLoader';
import * as todosService from '../api/todos';

interface TodoIt {
  tempTodo: Todo;
  controlChecked: number[];
  setControlChecked: Dispatch<SetStateAction<number[]>>;
  setTodoItem: Dispatch<SetStateAction<Todo[]>>;
  handleTodoDelete: (usersId: number) => void;
  arrTodos: number[];
  delLoader: number | null;
}

export const TodoItem: React.FC<TodoIt> = ({
  tempTodo,
  setControlChecked,
  setTodoItem,
  handleTodoDelete,
  arrTodos,
  delLoader,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tempTodo.title);

  const toggleTodo = (id: number) => {
    setControlChecked(prev =>
      prev.includes(id) ? prev.filter(todoId => todoId !== id) : [...prev, id],
    );

    setTodoItem(prevItems =>
      prevItems.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );

    const todoToUpdate = { ...tempTodo, completed: !tempTodo.completed };

    todosService
      .updatePost(todoToUpdate)
      .catch(() => {
        alert('Unable to update a todo');
        setTodoItem(prevItems =>
          prevItems.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        );
      })
      .finally(() => {
        setControlChecked(prev => prev.filter(todoId => todoId !== id));
      });
  };

  const isLoading = arrTodos.includes(tempTodo.id) || delLoader === tempTodo.id;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditSubmit = () => {
    if (!editValue.trim()) {
      handleTodoDelete(tempTodo.id);

      return;
    }

    const updatedTodo = { ...tempTodo, title: editValue };

    todosService
      .updatePost(updatedTodo)
      .then(() => {
        setTodoItem(prevItems =>
          prevItems.map(todo => (todo.id === tempTodo.id ? updatedTodo : todo)),
        );
      })
      .catch(() => {
        alert('Failed to update the todo');
      })
      .finally(() => {
        setIsEditing(false);
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
          onClick={() => toggleTodo(tempTodo.id)}
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
              autoFocus
            />
          </form>
        ) : (
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={handleEdit}
          >
            {tempTodo.title}
          </span>
        )}

        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDelete"
          onClick={() => handleTodoDelete(tempTodo.id)}
        >
          ×
        </button>

        <TodoLoader isActive={isLoading || delLoader === tempTodo.id} />
      </div>
    </div>
  );
};
