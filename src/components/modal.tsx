import { Transition, Dialog } from "@headlessui/react";
import React, { Fragment } from "react";

interface IModal {
  title: string;
  body: React.JSX.Element;
  openModal: boolean;
  setOpenModal: (param: boolean) => void;
  onClose?: null | (() => void);
}

export function Modal({
  title,
  body,
  openModal,
  setOpenModal,
  onClose = null,
}: IModal) {
  return (
    <Transition appear show={openModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          setOpenModal(false);
          if (onClose !== null) {
            onClose();
          }
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-5/6 md:w-2/3 transform overflow-hidden rounded-2xl bg-slate-600 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold text-white justify-center flex mb-6"
                >
                  {title}
                </Dialog.Title>
                <div className="text-white">{body}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
