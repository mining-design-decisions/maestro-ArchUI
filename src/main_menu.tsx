import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import React from "react";

const prefix = "/archui";
const navigation = [
  {
    name: "Classify Issues",
    href: `${prefix}/classify-issues`,
    current: false,
  },
  { name: "Statistics", href: `${prefix}/statistics`, current: false },
  { name: "Tags", href: `${prefix}/tags`, current: false },
  { name: "Search", href: `${prefix}/search`, current: false },
  { name: "Settings", href: `${prefix}/settings`, current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function MainMenu() {
  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <a
                    href={`${prefix}`}
                    className="text-xl font-bold text-inherit"
                  >
                    Arch UI
                  </a>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    <Menu
                      as="div"
                      className={classNames(
                        false
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}
                      aria-current={true ? "page" : undefined}
                    >
                      <div>
                        <Menu.Button className="inline-flex">
                          ML Models
                          <ChevronDownIcon
                            className="-mr-1 h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute z-10 mt-2 w-48 rounded-md bg-slate-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href={`${prefix}/ml-models/embeddings`}
                                className={classNames(
                                  active ? "bg-gray-600" : "",
                                  "block px-4 py-2 text-sm text-white"
                                )}
                              >
                                Word Embeddings
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href={`${prefix}/ml-models/ml-models`}
                                className={classNames(
                                  active ? "bg-gray-600" : "",
                                  "block px-4 py-2 text-sm text-white"
                                )}
                              >
                                ML Models
                              </a>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <Disclosure.Button
                key={"Word Embeddings"}
                as="a"
                href={`${prefix}/ml-models/embeddings`}
                className={classNames(
                  false
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "block rounded-md px-3 py-2 text-base font-medium"
                )}
                aria-current={false ? "page" : undefined}
              >
                {"Word Embeddings"}
              </Disclosure.Button>
              <Disclosure.Button
                key={"ML Models"}
                as="a"
                href={`${prefix}/ml-models/ml-models`}
                className={classNames(
                  false
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "block rounded-md px-3 py-2 text-base font-medium"
                )}
                aria-current={false ? "page" : undefined}
              >
                {"ML Models"}
              </Disclosure.Button>
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
