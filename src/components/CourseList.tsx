'use client';

import { useState, useEffect, useRef } from 'react';

interface IndeterminateCheckboxProps {
  checked: boolean;
  indeterminate: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
}

function IndeterminateCheckbox({ checked, indeterminate, onChange, className, onClick }: IndeterminateCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={className}
      onClick={onClick}
    />
  );
}

interface Course {
  id: string;
  name: string;
  modules: Module[];
}

interface Module {
  id: string;
  name: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  name: string;
}

interface CourseListProps {
  isLoggedIn: boolean;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  selectedItems: Record<string, boolean>;
  setSelectedItems: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onLogout?: () => void;
}

export default function CourseList({ isLoggedIn, courses, setCourses, selectedItems, setSelectedItems, onLogout }: CourseListProps) {
  const [collapsedCourses, setCollapsedCourses] = useState<Record<string, boolean>>({});
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  // No fetching logic, use props.courses
  useEffect(() => {
    if (isLoggedIn) {
      const fetchCourses = async () => {
        // Simulate fetching courses
        const mockCourses: Course[] = [
          {
            id: 'course1',
            name: 'React Basics',
            modules: [
              {
                id: 'mod1',
                name: 'Module 1: Introduction to React',
                lessons: [
                  { id: 'les1', name: 'Lesson 1.1: What is React?' },
                  { id: 'les2', name: 'Lesson 1.2: React Components' },
                ],
              },
              {
                id: 'mod2',
                name: 'Module 2: React State',
                lessons: [
                  { id: 'les3', name: 'Lesson 2.1: useState Hook' },
                  { id: 'les4', name: 'Lesson 2.2: Class Components' },
                ],
              },
            ],
          },
          {
            id: 'course2',
            name: 'Advanced React',
            modules: [
              {
                id: 'mod3',
                name: 'Module 1: React Router',
                lessons: [
                  { id: 'les5', name: 'Lesson 1.1: BrowserRouter' },
                  { id: 'les6', name: 'Lesson 1.2: Route and Link' },
                ],
              },
              {
                id: 'mod4',
                name: 'Module 2: Data Fetching',
                lessons: [
                  { id: 'les7', name: 'Lesson 2.1: Fetch API' },
                  { id: 'les8', name: 'Lesson 2.2: Data Fetching' },
                ],
              },
            ],
          },
          {
            id: 'course3',
            name: 'Data Science Fundamentals',
            modules: [
              {
                id: 'mod5',
                name: 'Module 1: Python Basics',
                lessons: [
                  { id: 'les10', name: 'Lesson 1.1: Syntax' },
                  { id: 'les11', name: 'Lesson 1.2: Data Structures' },
                ],
              },
              {
                id: 'mod6',
                name: 'Module 2: Pandas',
                lessons: [
                  { id: 'les12', name: 'Lesson 2.1: DataFrames' },
                  { id: 'les13', name: 'Lesson 2.2: Series' },
                ],
              },
            ],
          },
          {
            id: 'course4',
            name: 'Machine Learning',
            modules: [
              {
                id: 'mod7',
                name: 'Module 1: Supervised Learning',
                lessons: [
                  { id: 'les14', name: 'Lesson 1.1: Regression' },
                  { id: 'les15', name: 'Lesson 1.2: Classification' },
                ],
              },
              {
                id: 'mod8',
                name: 'Module 2: Unsupervised Learning',
                lessons: [
                  { id: 'les16', name: 'Lesson 2.1: Clustering' },
                  { id: 'les17', name: 'Lesson 2.2: Dimensionality Reduction' },
                ],
              },
            ],
          },
        ];
        setCourses(mockCourses);
      };
      fetchCourses();
    }
  }, [isLoggedIn]);

  // Helper to get all descendant ids
  const getDescendantIds = (course: Course) => {
    const ids: string[] = [course.id];
    course.modules.forEach(module => {
      ids.push(module.id);
      module.lessons.forEach(lesson => ids.push(lesson.id));
    });
    return ids;
  };

  const getModuleDescendantIds = (module: Module) => {
    const ids: string[] = [module.id];
    module.lessons.forEach(lesson => ids.push(lesson.id));
    return ids;
  };

  // Selection logic
  const handleCourseSelect = (course: Course) => {
    const ids = getDescendantIds(course);
    const allSelected = ids.every(id => selectedItems[id]);
    setSelectedItems(prev => {
      const updated = { ...prev };
      ids.forEach(id => { updated[id] = !allSelected; });
      return updated;
    });
  };

  const handleModuleSelect = (module: Module) => {
    const ids = getModuleDescendantIds(module);
    const allSelected = ids.every(id => selectedItems[id]);
    setSelectedItems(prev => {
      const updated = { ...prev };
      ids.forEach(id => { updated[id] = !allSelected; });
      return updated;
    });
  };

  const handleLessonSelect = (lessonId: string) => {
    setSelectedItems(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  // Collapse logic
  const toggleCourseCollapse = (courseId: string) => {
    setCollapsedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };
  const toggleModuleCollapse = (moduleId: string) => {
    setCollapsedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // Indeterminate logic
  const getCourseState = (course: Course) => {
    const ids = getDescendantIds(course);
    const checked = ids.every(id => selectedItems[id]);
    const some = ids.some(id => selectedItems[id]);
    return { checked, indeterminate: !checked && some };
  };
  const getModuleState = (module: Module) => {
    const ids = getModuleDescendantIds(module);
    const checked = ids.every(id => selectedItems[id]);
    const some = ids.some(id => selectedItems[id]);
    return { checked, indeterminate: !checked && some };
  };

  if (!isLoggedIn) {
    return <p>Please log in to see the courses.</p>;
  }

  return (
    <div className="space-y-3">
      {onLogout && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onLogout}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded font-semibold shadow-sm transition"
          >
            Logout
          </button>
        </div>
      )}
      {courses.map(course => {
        const courseState = getCourseState(course);
        return (
          <div key={course.id} className="border rounded-lg bg-gray-50">
            <div className="flex items-center px-4 py-2 cursor-pointer select-none group" onClick={() => toggleCourseCollapse(course.id)}>
              <span className="mr-2 text-gray-400 group-hover:text-primary transition">
                {collapsedCourses[course.id] ? '▶' : '▼'}
              </span>
              <IndeterminateCheckbox
                checked={courseState.checked}
                indeterminate={courseState.indeterminate}
                onChange={e => { e.stopPropagation(); handleCourseSelect(course); }}
                className="accent-primary w-5 h-5"
                onClick={e => e.stopPropagation()}
              />
              <span className="ml-3 font-bold text-lg text-primary-dark group-hover:underline">
                {course.name}
              </span>
            </div>
            {!collapsedCourses[course.id] && (
              <div className="ml-8 pb-2">
                {course.modules.map(module => {
                  const moduleState = getModuleState(module);
                  return (
                    <div key={module.id} className="mb-2">
                      <div className="flex items-center cursor-pointer select-none group" onClick={() => toggleModuleCollapse(module.id)}>
                        <span className="mr-2 text-gray-400 group-hover:text-primary transition">
                          {collapsedModules[module.id] ? '▶' : '▼'}
                        </span>
                        <IndeterminateCheckbox
                          checked={moduleState.checked}
                          indeterminate={moduleState.indeterminate}
                          onChange={e => { e.stopPropagation(); handleModuleSelect(module); }}
                          className="accent-primary w-4 h-4"
                          onClick={e => e.stopPropagation()}
                        />
                        <span className="ml-2 font-semibold text-gray-700 group-hover:underline">
                          {module.name}
                        </span>
                      </div>
                      {!collapsedModules[module.id] && (
                        <div className="ml-8 mt-1">
                          {module.lessons.map(lesson => (
                            <div key={lesson.id} className="flex items-center mb-1">
                              <input
                                type="checkbox"
                                checked={!!selectedItems[lesson.id]}
                                onChange={() => handleLessonSelect(lesson.id)}
                                className="accent-primary w-4 h-4"
                              />
                              <span className="ml-2 text-gray-600">{lesson.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
