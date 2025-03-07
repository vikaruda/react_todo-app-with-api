/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import * as todosService from './api/todos';
import { Todo } from './types/Todo';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { TodoFilter } from './types/FilterEnum';
import { ErrorNotification } from './components/ErrorNotification';

export const App: React.FC = () => {
  const [creatNewTodos, setCreateNewTodos] = useState('');
  const [todoItem, setTodoItem] = useState<Todo[]>([]);
  const [errorState, setStateError] = useState('');
  const userId = todosService.USER_ID;
  const [controlChecked, setControlChecked] = useState<number[]>([]);
  const [filter, setFilter] = useState(TodoFilter.All);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingNewItem, setLoadingNewItem] = useState(false);
  const [arrTodos, setArrTodos] = useState<number[]>([]);
  const [delLoader, setDelLoader] = useState<number | null>(null);
  const activeCount = todoItem.filter(todo => !todo.completed);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  useEffect(() => {
    todosService
      .getTodos()
      .then(setTodoItem)
      .catch(() => setStateError('Unable to load todos'));
  }, []);

  useEffect(() => {
    if (errorState) {
      const timer = setTimeout(() => {
        setStateError('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorState]);

  const getFilteredTodos = () => {
    if (filter === TodoFilter.Active) {
      return todoItem.filter(todo => !todo.completed);
    }

    if (filter === TodoFilter.Completed) {
      return todoItem.filter(todo => todo.completed);
    }

    return todoItem;
  };

  const filteredTodos = getFilteredTodos();

  useEffect(() => {
    if (inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // Add a small delay

      return () => clearTimeout(timer);
    }
  }, [todoItem]);


  const handleForm = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedTitle = creatNewTodos.trim();

    if (trimmedTitle === '') {
      setStateError('Title should not be empty');

      return;
    }

    const newTodo: Omit<Todo, 'id'> = {
      userId,
      title: trimmedTitle,
      completed: false,
    };

    const tempTodo2: Todo = {
      id: Date.now(),
      ...newTodo,
    };

    setTempTodo(tempTodo2);
    setLoadingNewItem(true);

    todosService
      .createPost(newTodo)
      .then(createdTodo => {
        setCreateNewTodos('');
        setTodoItem(prev => [...prev, createdTodo]);
        setArrTodos(prevItem => [...prevItem, createdTodo.id]);

        if (inputRef.current) {
          inputRef.current.focus();
        }
      })
      .catch(() => {
        setStateError('Unable to add a todo');
      })
      .finally(() => {
        setLoadingNewItem(false); // Stop loading
        setTempTodo(null); // Reset tempTodo
        setTimeout(() => {
          setArrTodos([]);
        }, 1000);
      });
  };

  const forClearCompleted = () => {
    // перебираємо значення комплітед, а потім комплітед сортуємо по айді
    const completedTodo = todoItem.filter(todo => todo.completed);
    const completedIds = completedTodo.map(todo => todo.id);

    // фільтруємо значення які не є комплітед, щоб їх видалити
    // ще тут ми показуємо видалені елементи локкально
    setTodoItem(prev => prev.filter(todo => !completedIds.includes(todo.id)));

    // перебираємо комплітед і вибраними айдішниками та видялаємо їх за допомогою методу
    // а тут ми видаляємо елементи із серверу
    // completedIds.forEach(id => {
    //   todosService.deleteTodos(id).catch(() => {
    //     setTimeout(() => setStateError(''), 3000);
    //   });
    // });
  };

  const errorGetTodos = () => {
    setStateError('');

    if (creatNewTodos.trim() === '') {
      setStateError('Title should not be empty');
      setTimeout(() => {
        setStateError('');
      }, 3000);

      return;
    }
  };

  const handleTodoDelete = (usersId: number) => {
    setArrTodos(prevItem => prevItem.filter(id => id !== usersId));
    setDelLoader(userId);
    todosService
      .deleteTodos(usersId)
      .then(() => {
        setTodoItem(prevTodos => prevTodos.filter(todo => todo.id !== usersId));
        setDelLoader(usersId);
      })
      .catch(() => {
        setStateError('Unable to delete a todo ');
        setTimeout(() => setStateError(''), 3000);
      })
      .finally(() => {
        setTimeout(() => {
          setDelLoader(null);
          setArrTodos(prev => prev.filter(id => id !== usersId));
        }, 1000);
      });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updatedPost = (updatedPosts: Todo) => {
    todosService
      .updatePost(updatedPosts)
      .then(post => {
        setTodoItem(currentPost => {
          const newPost = [...currentPost];
          const index = newPost.findIndex(item => item.id === updatedPosts.id);

          newPost.splice(index, 1, post);

          return newPost;
        });
      })
      .catch(() => {
        setStateError('Unable to update a todo');
        setTimeout(() => setStateError(''), 3000);
      });
  };

  if (!todosService.USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          handleForm={handleForm}
          errorGetTodos={errorGetTodos}
          setCreateNewTodos={setCreateNewTodos}
          createNewTodos={creatNewTodos}
          inputRef={inputRef}
          loadingNewItem={loadingNewItem}
        />

        <section className="todoapp__main" data-cy="TodoList">
          <TodoList
            todos={filteredTodos}
            tempTodo={tempTodo}
            controlChecked={controlChecked}
            setControlChecked={setControlChecked}
            setTodoItem={setTodoItem}
            handleTodoDelete={handleTodoDelete}
            arrTodos={arrTodos}
            delLoader={delLoader}
          />
        </section>

        {todoItem.length > 0 && (
          <Footer
            todoItem={todoItem}
            filter={filter}
            setFilter={setFilter}
            forClearCompleted={forClearCompleted}
            activeCount={activeCount}
          />
        )}
      </div>

      <ErrorNotification
        errorState={errorState}
        setStateError={setStateError}
      />
    </div>
  );
};
